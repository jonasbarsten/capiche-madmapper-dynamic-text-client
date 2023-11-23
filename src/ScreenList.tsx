export const ScreenList = ({
  selectedScreens,
  handleSelectScreen,
}: {
  selectedScreens: string[];
  handleSelectScreen: (screenName: string, checked: boolean) => void;
}) => {
  return (
    <div className="max-w-xs mx-auto mt-6 flex flex-col space-y-3">
      <div className="flex space-x-6 m-auto">
        <p>Screen 1</p>
        <input
          type="checkbox"
          checked={selectedScreens.includes("screen1")}
          onChange={(e) => {
            handleSelectScreen("screen1", e.target.checked);
          }}
          className="checkbox"
        />
      </div>
      <div className="flex space-x-6 m-auto">
        <p>Screen 2</p>
        <input
          type="checkbox"
          checked={selectedScreens.includes("screen2")}
          onChange={(e) => {
            handleSelectScreen("screen2", e.target.checked);
          }}
          className="checkbox"
        />
      </div>
      <div className="flex space-x-6 m-auto">
        <p>Screen 3</p>
        <input
          type="checkbox"
          checked={selectedScreens.includes("screen3")}
          onChange={(e) => {
            handleSelectScreen("screen3", e.target.checked);
          }}
          className="checkbox"
        />
      </div>
      <div className="flex space-x-6 m-auto">
        <p>Screen 4</p>
        <input
          type="checkbox"
          checked={selectedScreens.includes("screen4")}
          onChange={(e) => {
            handleSelectScreen("screen4", e.target.checked);
          }}
          className="checkbox"
        />
      </div>
      <div className="flex space-x-6 m-auto">
        <p>Screen 5</p>
        <input
          type="checkbox"
          checked={selectedScreens.includes("screen5")}
          onChange={(e) => {
            handleSelectScreen("screen5", e.target.checked);
          }}
          className="checkbox"
        />
      </div>
    </div>
  );
};
