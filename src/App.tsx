import { useEffect, useState } from "react";
import "./App.css";
import useWebSocket from "react-use-websocket";
import { settings } from "./settings";

import { ScreenList } from "./ScreenList";
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

const screens = settings.screens;

export type Preset = {
  id: string;
  text: string;
  screens: string[];
  transparentBg?: boolean;
  flash?: boolean;
  font?: "texting" | "hal" | "corporate";
  fontSize?: number;
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

  useEffect(() => {
    if (!selectedPreset) return;
    handlePlayPreset(selectedPreset);
  }, [selectedPreset]);

  useEffect(() => {
    for (const screenName of selectedScreens) {
      sendTextMessage(screenName, text);
    }
  }, [text, selectedScreens]);

  useEffect(() => {
    if (!lastMessage) return;
    const savedPresets = JSON.parse(lastMessage.data);
    setPresetsBuffer(savedPresets);
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

  const sendTextMessage = (screenName: string, textValue: string) => {
    const address = settings.addresses[screenName].doubleLine.text;
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
            address: settings.addresses[screenName].doubleLine.visible,
            args: [{ value: "false", type: "s" }],
          },
        })
      );
    } else {
      sendMessage(
        JSON.stringify({
          cmd: "osc",
          data: {
            address: settings.addresses[screenName].doubleLine.visible,
            args: [{ value: "true", type: "s" }],
          },
        })
      );
    }
  };

  const sendBlendMode = (screenName: string, blend: "Over" | "Add") => {
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: settings.addresses[screenName].doubleLine.blendMode,
          args: [{ value: blend, type: "s" }],
        },
      })
    );
  };

  const sendFlash = (screenName: string, flash: boolean) => {
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: settings.addresses[screenName].doubleLine.oscillator,
          args: [{ value: flash ? "true" : "false", type: "s" }],
        },
      })
    );
    // Set opacity to max
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: settings.addresses[screenName].doubleLine.opacity,
          args: [{ value: 100, type: "i" }],
        },
      })
    );
  };

  const sendFont = (screenName: string, font: Preset["font"]) => {
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
          address: settings.addresses[screenName].doubleLine.font,
          args: [{ value: fontMap[font], type: "s" }],
        },
      })
    );
  };

  const sendFontSize = (screenName: string, fontSize?: number) => {
    if (!fontSize) return;
    sendMessage(
      JSON.stringify({
        cmd: "osc",
        data: {
          address: settings.addresses[screenName].doubleLine.fontSize,
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
    };
    setPresetsBuffer((prevState) => [...prevState, newPreset]);
    sendMessage(
      JSON.stringify({
        cmd: "writePreset",
        data: [...presetsBuffer, newPreset],
      })
    );
  };

  const handlePlayPreset = (preset: Preset) => {
    const otherScreens = screens.filter(
      (otherScreenName) => !preset.screens.includes(otherScreenName)
    );
    for (const screenName of preset.screens) {
      sendTextMessage(screenName, preset.text);
      sendBlendMode(screenName, preset.transparentBg ? "Add" : "Over");
      sendFlash(screenName, !!preset.flash);
      sendFont(screenName, preset.font);
      sendFontSize(screenName, preset.fontSize);
    }
    for (const otherScreen of otherScreens) {
      sendMessage(
        JSON.stringify({
          cmd: "osc",
          data: {
            address: settings.addresses[otherScreen].doubleLine.visible,
            args: [{ value: "false", type: "s" }],
          },
        })
      );
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
      sendMessage(
        JSON.stringify({
          cmd: "osc",
          data: {
            address: settings.addresses[screenName].doubleLine.visible,
            args: [{ value: "false", type: "s" }],
          },
        })
      );
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
                  <th></th>
                  <th>Text</th>
                  <th>Screens</th>
                  <th>Function</th>
                  <th>Font</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {presetsBuffer.map((preset) => (
                  <SortablePresetItem
                    key={preset.id}
                    preset={preset}
                    selectedPreset={selectedPreset}
                    handleUpdatePreset={handleUpdatePreset}
                    handleSelectPreset={(preset) => setSelectedPreset(preset)}
                    handleDeletePreset={handleDeletePreset}
                  ></SortablePresetItem>
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex space-x-1">
        <button className="btn" onClick={prevPreset}>
          Prev
        </button>
        <button className="btn" onClick={nextPreset}>
          Next
        </button>
      </div>
      <div className="flex flex-col mb-10 space-y-1">
        <button className="btn" onClick={handleClearAll}>
          Clear all
        </button>
      </div>
      <textarea
        className="textarea textarea-primary"
        onChange={(e) => setText(e.target.value)}
      />
      <ScreenList
        selectedScreens={selectedScreens}
        handleSelectScreen={handleSelectScreen}
      />
      <button className="btn mt-6" onClick={handleSavePreset}>
        Save as preset
      </button>
    </div>
  );
}

export default App;
