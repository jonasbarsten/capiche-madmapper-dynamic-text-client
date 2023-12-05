import { ScreenList } from "./ScreenList";

export const ActionsPanel = ({
  prevPreset,
  nextPreset,
  handleClearAll,
  setText,
  selectedScreens,
  handleSelectScreen,
  handleSavePreset,
}: {
  prevPreset: () => void;
  nextPreset: () => void;
  handleClearAll: () => void;
  setText: (s: string) => void;
  selectedScreens: string[];
  handleSelectScreen: (screenName: string, checked: boolean) => void;
  handleSavePreset: () => void;
}) => {
  return (
    <div>
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
};
