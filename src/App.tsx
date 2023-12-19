import { useEffect, useState } from "react";
import "./App.css";
import useWebSocket from "react-use-websocket";
import { TextLayer, settings } from "./settings";
import { layers, getLayerAddresses } from "./settings";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortablePresetItem } from "./SortablePresetItem";
import { ActionsPanel } from "./ActionsPanel";

const screens = settings.screens;

export type Preset = {
  id: string;
  text: string;
  screens: string[];
  transparentBg?: boolean;
  flash?: boolean;
  font?: "texting" | "hal" | "corporate";
  fontSize?: number;
  color?: string;
  layer: `layer${number}`;
  chokeLayer?: boolean; // Will hide all other visuals on same layer when played
  typeWriter?: {
    enabled: boolean;
    intervalMs: number;
  };
};

type OscColor = {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
  a: number; // 0. - 1.0
};

type OscArg = {
  type: "s" | "i" | "f" | "r";
  value: string | boolean | number | OscColor; // "r" = OscColor
};

type OscMessage = {
  address: string;
  args: OscArg[];
};

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const { sendMessage, lastMessage } = useWebSocket("ws://localhost:8085");
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [presetsBuffer, setPresetsBuffer] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<Preset>();
  const [text, setText] = useState("");

  const selectedPresetIndex = presetsBuffer.findIndex(
    (preset) => preset.id === selectedPreset?.id
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleWsAction = (action: string) => {
    switch (action) {
      case "firstPreset": {
        if (presetsBuffer.length > 0) {
          setSelectedPreset(presetsBuffer[0]);
        }
        break;
      }
      case "nextPreset": {
        nextPreset();
        break;
      }
      case "prevPreset": {
        prevPreset();
        break;
      }
      case "clearAll": {
        handleClearAll();
        break;
      }
    }
  };

  useEffect(() => {
    if (!selectedPreset) return;
    handlePlayPreset(selectedPreset);
    const presetElem = document.getElementById(`preset-${selectedPreset.id}`);
    presetElem?.scrollIntoView({ behavior: "instant", block: "center" });
  }, [selectedPreset]);

  useEffect(() => {
    for (const screenName of selectedScreens) {
      const textLayer = layers[screenName]["layer1"];
      sendTextMessage(textLayer, text);
    }
  }, [text, selectedScreens]);

  useEffect(() => {
    if (!lastMessage) return;
    const data = JSON.parse(lastMessage.data);
    if (data.presets) {
      const savedPresets = JSON.parse(data.presets);
      setPresetsBuffer(savedPresets);
    }
    if (data.action) {
      handleWsAction(data.action);
    }
  }, [lastMessage]);

  const nextPreset = () => {
    setSelectedPreset(presetsBuffer[selectedPresetIndex + 1]);
  };

  const prevPreset = () => {
    setSelectedPreset(presetsBuffer[selectedPresetIndex - 1]);
  };

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight") nextPreset();
      if (e.code === "ArrowLeft") prevPreset();
    };
    window.addEventListener("keydown", keyDownHandler);
    return () => {
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, [nextPreset, prevPreset]);

  const sendTextMessage = (textLayer: TextLayer, textValue: string) => {
    const { text: textAddress, visible: visibleAddress } =
      getLayerAddresses(textLayer);

    const address = textAddress;
    const oscMessage: OscMessage = {
      address,
      args: [{ value: textValue, type: "s" }],
    };
    sendMessage(JSON.stringify({ data: oscMessage, cmd: "osc" }));
    if (textValue.length < 1) {
      sendMessage(
        JSON.stringify({
          cmd: "osc",
          data: {
            address: visibleAddress,
            args: [{ value: "false", type: "s" }],
          },
        })
      );
    } else {
      sendMessage(
        JSON.stringify({
          cmd: "osc",
          data: {
            address: visibleAddress,
            args: [{ value: "true", type: "s" }],
          },
        })
      );
    }
  };

  const sendBlendMode = (textLayer: TextLayer, blend: "Over" | "Add") => {
    const { blendMode: blendModeAddress } = getLayerAddresses(textLayer);
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: blendModeAddress,
          args: [{ value: blend, type: "s" }],
        },
      })
    );
  };

  const sendFlash = (textLayer: TextLayer, flash: boolean) => {
    const { oscillator: oscillatorAddress, opacity: opacityAddress } =
      getLayerAddresses(textLayer);
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: oscillatorAddress,
          args: [{ value: flash ? "true" : "false", type: "s" }],
        },
      })
    );
    // Set opacity to max
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: opacityAddress,
          args: [{ value: 100, type: "i" }],
        },
      })
    );
  };

  const sendFont = (textLayer: TextLayer, font: Preset["font"]) => {
    const { font: fontAddress } = getLayerAddresses(textLayer);
    if (!font) return;
    const fontMap = {
      texting: "Arial",
      hal: "Arcade",
      corporate: "Times New Roman",
    };
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: fontAddress,
          args: [{ value: fontMap[font], type: "s" }],
        },
      })
    );
  };

  const sendColor = (textLayer: TextLayer, color: Preset["color"]) => {
    const { color: colorAddress } = getLayerAddresses(textLayer);
    if (!color) return;
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: colorAddress,
          args: [{ value: color, type: "s" }],
        },
      })
    );
  };

  const sendFontSize = (textLayer: TextLayer, fontSize?: number) => {
    const { fontSize: fontSizeAddress } = getLayerAddresses(textLayer);
    if (!fontSize) return;
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: fontSizeAddress,
          args: [{ value: fontSize, type: "i" }],
        },
      })
    );
  };

  const handleSelectScreen = (screenName: string, checked: boolean) => {
    const screensWithoutThisScreen = selectedScreens.filter(
      (screen) => screen !== screenName
    );
    if (checked) {
      screensWithoutThisScreen.push(screenName);
    }
    setSelectedScreens(screensWithoutThisScreen);
  };

  const handleSavePreset = () => {
    const newPreset: Preset = {
      id: uuidv4(),
      text,
      screens: selectedScreens,
      layer: "layer1",
    };
    setPresetsBuffer((prevState) => [...prevState, newPreset]);
    sendMessage(
      JSON.stringify({
        cmd: "writePreset",
        data: [...presetsBuffer, newPreset],
      })
    );
  };

  const sendTextAsTypeWriter = async (
    textLayer: TextLayer,
    preset: Preset
    // intervalMs: number
  ) => {
    // if (!preset.text) return;
    const textArr = preset.text.split("");
    // if (!textArr) return;
    let textBuffer = textArr.shift() || "";
    // if (!textBuffer) return;
    while (textBuffer.length <= preset.text.length) {
      sendTextMessage(textLayer, textBuffer);
      textBuffer += textArr.shift();
      await timeout(
        preset.typeWriter?.intervalMs || settings.typewriterIntervals.medium
      );
    }
  };

  const handlePlayPreset = (preset: Preset) => {
    const otherScreens = screens.filter(
      (otherScreenName) => !preset.screens.includes(otherScreenName)
    );
    for (const screenName of preset.screens) {
      const textLayer = layers[screenName][preset.layer];
      // sendTextMessage(textLayer, preset.text);
      sendBlendMode(textLayer, preset.transparentBg ? "Add" : "Over");
      sendFlash(textLayer, !!preset.flash);
      sendFont(textLayer, preset.font);
      sendColor(textLayer, preset.color);
      sendFontSize(textLayer, preset.fontSize);
    }
    if (preset.chokeLayer) {
      for (const otherScreen of otherScreens) {
        const textLayer = layers[otherScreen][preset.layer];
        const { visible: visibleAddress } = getLayerAddresses(textLayer);
        sendMessage(
          JSON.stringify({
            cmd: "osc",
            data: {
              address: visibleAddress,
              args: [{ value: "false", type: "s" }],
            },
          })
        );
      }
    }
    if (preset.typeWriter?.enabled) {
      const promises = [];
      for (const screenName of preset.screens) {
        const textLayer = layers[screenName][preset.layer];
        promises.push(sendTextAsTypeWriter(textLayer, preset));
      }
      Promise.all(promises).then(() => {});
    } else {
      for (const screenName of preset.screens) {
        const textLayer = layers[screenName][preset.layer];
        sendTextMessage(textLayer, preset.text);
      }
    }
  };

  const handleDeletePreset = (preset: Preset) => {
    const sure = confirm("Are you sure you want to delete this preset?");
    if (!sure) return;
    const allButThisPreset = presetsBuffer.filter(
      (bufferPreset) => bufferPreset.id !== preset.id
    );
    setPresetsBuffer(allButThisPreset);
    sendMessage(
      JSON.stringify({
        cmd: "writePreset",
        data: allButThisPreset,
      })
    );
    handleClearAll();
  };

  const handleAddEmptyBelow = (index: number) => {
    const newPreset: Preset = {
      id: uuidv4(),
      text: "",
      screens: selectedScreens,
      layer: "layer1",
    };
    const presetsBufferCopy = [...presetsBuffer];
    presetsBufferCopy.splice(index + 1, 0, newPreset);
    setPresetsBuffer(presetsBufferCopy);
    sendMessage(
      JSON.stringify({
        cmd: "writePreset",
        data: presetsBufferCopy,
      })
    );
  };

  const handleUpdatePreset = (newPreset: Preset) => {
    const allUpdatedPresets = presetsBuffer.map((bufferPreset) => {
      if (bufferPreset.id === newPreset.id) {
        return newPreset;
      }
      return bufferPreset;
    });
    handlePlayPreset(newPreset);
    setPresetsBuffer(allUpdatedPresets);
    sendMessage(
      JSON.stringify({
        cmd: "writePreset",
        data: allUpdatedPresets,
      })
    );
  };

  const handleClearAll = () => {
    for (const screenName of screens) {
      for (const layerName of settings.layers) {
        const textLayer = layers[screenName][layerName];
        const { visible: visibleAddress } = getLayerAddresses(textLayer);
        sendMessage(
          JSON.stringify({
            cmd: "osc",
            data: {
              address: visibleAddress,
              args: [{ value: "false", type: "s" }],
            },
          })
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = presetsBuffer.findIndex(
      (preset) => preset.id === active.id
    );
    const newIndex = presetsBuffer.findIndex((preset) => preset.id === over.id);

    const presetsInNewOrder = arrayMove(presetsBuffer, oldIndex, newIndex);
    setPresetsBuffer(presetsInNewOrder);
    // Write to disk
    sendMessage(
      JSON.stringify({
        cmd: "writePreset",
        data: presetsInNewOrder,
      })
    );
  };

  return (
    <div>
      <div className="fixed bottom-32 right-4 bg-gray-500 p-6 z-10 rounded-md">
        <ActionsPanel
          prevPreset={prevPreset}
          nextPreset={nextPreset}
          handleClearAll={handleClearAll}
          setText={setText}
          selectedScreens={selectedScreens}
          handleSelectScreen={handleSelectScreen}
          handleSavePreset={handleSavePreset}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={presetsBuffer}
          strategy={verticalListSortingStrategy}
        >
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th></th>
                  <th>Text</th>
                  <th>Screens</th>
                  <th>Layers</th>
                  <th>Function</th>
                  <th>Font</th>
                  <th>Typewriter</th>
                </tr>
              </thead>
              <tbody>
                {presetsBuffer.map((preset, i) => (
                  <SortablePresetItem
                    key={preset.id}
                    index={i}
                    preset={preset}
                    selectedPreset={selectedPreset}
                    handleUpdatePreset={handleUpdatePreset}
                    handleSelectPreset={(preset) => setSelectedPreset(preset)}
                    handleDeletePreset={handleDeletePreset}
                    handleAddEmptyBelow={handleAddEmptyBelow}
                  ></SortablePresetItem>
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default App;
