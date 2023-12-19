// type LineAddresses = {
//   text: string;
//   visible: string;
//   blendMode: string;
//   oscillator: string;
//   opacity: string;
//   font: string;
//   fontSize: string;
// };

// type ScreenAddresses = {
//   [key: string]: LineAddresses;
// };

export type AddressStrings = {
  visible: `/surfaces/${string}/${string}/visible`;
  blendMode: `/surfaces/${string}/${string}/blend_mode`;
  opacity: `/surfaces/${string}/${string}/opacity`;
  color: `/surfaces/${string}/${string}/color/rgba`;
  // MEDIA
  text: `/medias/${string}/Font/Text`;
  font: `/medias/${string}/Font/Font`;
  fontSize: `/medias/${string}/Font/Font_Size`;
  // FX
  oscillator: `/modules/${string}/active`;
};

const addressStringsMap: AddressStrings = {
  // QUAD
  visible: "/surfaces/{{GROUP_NAME}}/{{QUAD_NAME}}/visible",
  blendMode: "/surfaces/{{GROUP_NAME}}/{{QUAD_NAME}}/blend_mode",
  opacity: "/surfaces/{{GROUP_NAME}}/{{QUAD_NAME}}/opacity",
  color: "/surfaces/{{GROUP_NAME}}/{{QUAD_NAME}}/color/rgba",
  // MEDIA
  text: "/medias/{{MEDIA_NAME}}/Font/Text",
  font: "/medias/{{MEDIA_NAME}}/Font/Font",
  fontSize: "/medias/{{MEDIA_NAME}}/Font/Font_Size",
  // FX
  oscillator: "/modules/{{OSCILLATOR_NAME}}/active",
};

export type TextLayer = {
  groupName: string;
  quadName: string;
  mediaName: string;
  oscillatorName: string;
};

export const getLayerAddresses = (textLayer: TextLayer): AddressStrings => {
  const layerAddressStrings: Record<string, string> = {};

  for (const [addressKey, value] of Object.entries(addressStringsMap)) {
    const newValue = value
      .replace("{{GROUP_NAME}}", textLayer.groupName)
      .replace("{{QUAD_NAME}}", textLayer.quadName)
      .replace("{{MEDIA_NAME}}", textLayer.mediaName)
      .replace("{{OSCILLATOR_NAME}}", textLayer.oscillatorName);
    layerAddressStrings[addressKey] = newValue;
  }

  return layerAddressStrings as AddressStrings;
};

const subsGroupName = "Subtitles-1";

export const layers = {
  screen1: {
    layer1: {
      groupName: subsGroupName,
      quadName: "Screen_1_layer_1",
      mediaName: "Screen_1_layer_1",
      oscillatorName: "Oscillator_subs_screen_1",
    },
    layer2: {
      groupName: subsGroupName,
      quadName: "Screen_1_layer_2",
      mediaName: "Screen_1_layer_2",
      oscillatorName: "Oscillator_subs_screen_1",
    },
    layer3: {
      groupName: subsGroupName,
      quadName: "Screen_1_layer_3",
      mediaName: "Screen_1_layer_3",
      oscillatorName: "Oscillator_subs_screen_1",
    },
  },
  screen2: {
    layer1: {
      groupName: subsGroupName,
      quadName: "Screen_2_layer_1",
      mediaName: "Screen_2_layer_1",
      oscillatorName: "Oscillator_subs_screen_2",
    },
    layer2: {
      groupName: subsGroupName,
      quadName: "Screen_2_layer_2",
      mediaName: "Screen_2_layer_2",
      oscillatorName: "Oscillator_subs_screen_2",
    },
    layer3: {
      groupName: subsGroupName,
      quadName: "Screen_2_layer_3",
      mediaName: "Screen_2_layer_3",
      oscillatorName: "Oscillator_subs_screen_2",
    },
  },
  screen3: {
    layer1: {
      groupName: subsGroupName,
      quadName: "Screen_3_layer_1",
      mediaName: "Screen_3_layer_1",
      oscillatorName: "Oscillator_subs_screen_3",
    },
    layer2: {
      groupName: subsGroupName,
      quadName: "Screen_3_layer_2",
      mediaName: "Screen_3_layer_2",
      oscillatorName: "Oscillator_subs_screen_3",
    },
    layer3: {
      groupName: subsGroupName,
      quadName: "Screen_3_layer_3",
      mediaName: "Screen_3_layer_3",
      oscillatorName: "Oscillator_subs_screen_3",
    },
  },
  screen4: {
    layer1: {
      groupName: subsGroupName,
      quadName: "Screen_4_layer_1",
      mediaName: "Screen_4_layer_1",
      oscillatorName: "Oscillator_subs_screen_4",
    },
    layer2: {
      groupName: subsGroupName,
      quadName: "Screen_4_layer_2",
      mediaName: "Screen_4_layer_2",
      oscillatorName: "Oscillator_subs_screen_4",
    },
    layer3: {
      groupName: subsGroupName,
      quadName: "Screen_4_layer_3",
      mediaName: "Screen_4_layer_3",
      oscillatorName: "Oscillator_subs_screen_4",
    },
  },
  screen5: {
    layer1: {
      groupName: subsGroupName,
      quadName: "Screen_5_layer_1",
      mediaName: "Screen_5_layer_1",
      oscillatorName: "Oscillator_subs_screen_5",
    },
    layer2: {
      groupName: subsGroupName,
      quadName: "Screen_5_layer_2",
      mediaName: "Screen_5_layer_2",
      oscillatorName: "Oscillator_subs_screen_5",
    },
    layer3: {
      groupName: subsGroupName,
      quadName: "Screen_5_layer_3",
      mediaName: "Screen_5_layer_3",
      oscillatorName: "Oscillator_subs_screen_5",
    },
  },
} as { [key: string]: { [key: string]: TextLayer } };

export const settings = {
  screens: ["screen1", "screen2", "screen3", "screen4", "screen5"],
  layers: ["layer1", "layer2", "layer3"],
  colors: {
    white: "1. 1. 1. 1.",
    green: "0. 1. 0. 1.",
    blue: "0. 0. 1. 1.",
    black: "0. 0. 0, 1,",
  },
  typewriterIntervals: {
    slow: 500,
    medium: 250,
    fast: 100,
  },
} as {
  screens: string[];
  layers: string[];
  colors: { [key: string]: string };
  typewriterIntervals: { [key: string]: number };
};
