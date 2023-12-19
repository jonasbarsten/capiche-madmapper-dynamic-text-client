import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Preset } from "./App";
import { CiPlay1, CiTrash } from "react-icons/ci";
import { MdDragIndicator } from "react-icons/md";
import { useDebounce } from "usehooks-ts";
import { useEffect, useState } from "react";
import { settings } from "./settings";

export const SortablePresetItem = ({
  index,
  preset,
  selectedPreset,
  handleSelectPreset,
  handleUpdatePreset,
  handleDeletePreset,
}: {
  index: number;
  preset: Preset;
  selectedPreset?: Preset;
  handleSelectPreset: (preset: Preset) => void;
  handleUpdatePreset: (preset: Preset) => void;
  handleDeletePreset: (preset: Preset) => void;
}) => {
  const [text, setText] = useState<string>(preset.text);
  const debouncedValue = useDebounce<string>(text, 500);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: preset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (debouncedValue === preset.text) return;
    handleUpdatePreset({ ...preset, text: debouncedValue });
  }, [debouncedValue, preset, handleUpdatePreset]);

  const handleToggleScreenInPreset = (screenName: string) => {
    const exists = preset.screens.includes(screenName);
    // Remove
    if (exists) {
      const presetScreensWithoutThisScreen = preset.screens.filter(
        (screen) => screen != screenName
      );
      handleUpdatePreset({
        ...preset,
        screens: presetScreensWithoutThisScreen,
      });
      return;
    }
    // Add
    handleUpdatePreset({
      ...preset,
      screens: [...preset.screens, screenName],
    });
  };

  const handleTogglePresetLayer = (layerName: string) => {
    handleUpdatePreset({
      ...preset,
      layer: layerName as Preset["layer"],
    });
  };

  return (
    <tr
      id={`preset-${preset.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={
        preset.id === selectedPreset?.id
          ? "bg-base-200 border-4 border-green-500"
          : ""
      }
    >
      {/* <div className="flex space-x-1 items-center"> */}
      <td>{index + 1}</td>
      <td className="flex space-x-1 items-center">
        <MdDragIndicator {...listeners} />
        <button
          className="btn btn-xs"
          onClick={() => handleDeletePreset(preset)}
        >
          <CiTrash />
        </button>
        <button
          className="btn btn-xs"
          onClick={() => handleSelectPreset(preset)}
        >
          <CiPlay1 />
        </button>
      </td>
      <td>
        <textarea
          value={text}
          className="textarea textarea-primary"
          onChange={(e) => setText(e.target.value)}
        />
      </td>
      <td>
        <p>
          {settings.screens.map((screenName, i) => {
            let badeColor = "badge-ghost";
            if (preset.screens.includes(screenName)) {
              badeColor = "badge-primary";
            }
            return (
              <span
                key={i}
                className={`badge ${badeColor} m-1`}
                onClick={() => handleToggleScreenInPreset(screenName)}
              >
                {screenName}
              </span>
            );
          })}
        </p>
      </td>
      <td>
        <p>
          {settings.layers.map((layerName, i) => {
            let badeColor = "badge-ghost";
            if (preset.layer === layerName) {
              badeColor = "badge-primary";
            }
            return (
              <span
                key={i}
                className={`badge ${badeColor} m-1`}
                onClick={() => handleTogglePresetLayer(layerName)}
              >
                {layerName}
              </span>
            );
          })}
        </p>
      </td>
      <td>
        <span className="flex items-center justify-end">
          <span className="label-text">Transparent</span>
          <input
            type="checkbox"
            checked={!!preset.transparentBg}
            className="checkbox checkbox-xs"
            onChange={(e) =>
              handleUpdatePreset({ ...preset, transparentBg: e.target.checked })
            }
          />
        </span>
        <span className="flex items-center justify-end">
          Flash
          <input
            type="checkbox"
            checked={!!preset.flash}
            className="checkbox checkbox-xs"
            onChange={(e) =>
              handleUpdatePreset({ ...preset, flash: e.target.checked })
            }
          />
        </span>
        <span className="flex items-center justify-end">
          Choke layer
          <input
            type="checkbox"
            checked={!!preset.chokeLayer}
            className="checkbox checkbox-xs"
            onChange={(e) =>
              handleUpdatePreset({ ...preset, chokeLayer: e.target.checked })
            }
          />
        </span>
      </td>
      <td>
        <select
          className="select select-bordered select-xs w-full max-w-xs"
          onChange={(e) =>
            handleUpdatePreset({
              ...preset,
              font: e.target.value as Preset["font"],
            })
          }
          defaultValue={preset.font || "texting"}
        >
          <option value="texting">Texting</option>
          <option value="hal">HAL</option>
          <option value="corporate">Corporate</option>
        </select>
      </td>
      <td>
        <input
          type="number"
          value={preset.fontSize || 64}
          className="input w-full max-w-xs input-xs"
          min={1}
          max={300}
          onChange={(e) =>
            handleUpdatePreset({
              ...preset,
              fontSize: parseInt(e.target.value),
            })
          }
        />
      </td>
      <td>
        <select
          className="select select-bordered select-xs w-full max-w-xs"
          onChange={(e) =>
            handleUpdatePreset({
              ...preset,
              color: e.target.value as Preset["color"],
            })
          }
          defaultValue={preset.color}
        >
          <option disabled>None</option>
          <option value={settings.colors.white}>White</option>
          <option value={settings.colors.green}>Green</option>
          <option value={settings.colors.blue}>Blue</option>
          <option value={settings.colors.black}>Black</option>
        </select>
      </td>
    </tr>
  );
};
