type LineAddresses = {
  text: string;
  visible: string;
  blendMode: string;
  oscillator: string;
  opacity: string;
  font: string;
  fontSize: string;
};

type ScreenAddresses = {
  doubleLine: LineAddresses;
};

export const settings = {
  screens: ["screen1", "screen2", "screen3", "screen4", "screen5"],
  addresses: {
    screen1: {
      doubleLine: {
        text: "/medias/screen-1-double-line/Font/Text",
        visible: "/surfaces/Subtitles-1/Screen_1_double_line/visible",
        blendMode: "/surfaces/Subtitles-1/Screen_1_double_line/blend_mode",
        oscillator: "/modules/Oscillator_subs_screen_1/active",
        opacity: "/surfaces/Subtitles-1/Screen_1_double_line/opacity",
        font: "/medias/screen-1-double-line/Font/Font",
        fontSize: "/medias/screen-1-double-line/Font/Font_Size",
      },
    },
    screen2: {
      doubleLine: {
        text: "/medias/screen-2-double-line/Font/Text",
        visible: "/surfaces/Subtitles-1/Screen_2_double_line/visible",
        blendMode: "/surfaces/Subtitles-1/Screen_2_double_line/blend_mode",
        oscillator: "/modules/Oscillator_subs_screen_2/active",
        opacity: "/surfaces/Subtitles-1/Screen_2_double_line/opacity",
        font: "/medias/screen-2-double-line/Font/Font",
        fontSize: "/medias/screen-2-double-line/Font/Font_Size",
      },
    },
    screen3: {
      doubleLine: {
        text: "/medias/screen-3-double-line/Font/Text",
        visible: "/surfaces/Subtitles-1/Screen_3_double_line/visible",
        blendMode: "/surfaces/Subtitles-1/Screen_3_double_line/blend_mode",
        oscillator: "/modules/Oscillator_subs_screen_3/active",
        opacity: "/surfaces/Subtitles-1/Screen_3_double_line/opacity",
        font: "/medias/screen-3-double-line/Font/Font",
        fontSize: "/medias/screen-3-double-line/Font/Font_Size",
      },
    },
    screen4: {
      doubleLine: {
        text: "/medias/screen-4-double-line/Font/Text",
        visible: "/surfaces/Subtitles-1/Screen_4_double_line/visible",
        blendMode: "/surfaces/Subtitles-1/Screen_4_double_line/blend_mode",
        oscillator: "/modules/Oscillator_subs_screen_4/active",
        opacity: "/surfaces/Subtitles-1/Screen_4_double_line/opacity",
        font: "/medias/screen-4-double-line/Font/Font",
        fontSize: "/medias/screen-4-double-line/Font/Font_Size",
      },
    },
    screen5: {
      doubleLine: {
        text: "/medias/screen-5-double-line/Font/Text",
        visible: "/surfaces/Subtitles-1/Screen_5_double_line/visible",
        blendMode: "/surfaces/Subtitles-1/Screen_5_double_line/blend_mode",
        oscillator: "/modules/Oscillator_subs_screen_5/active",
        opacity: "/surfaces/Subtitles-1/Screen_5_double_line/opacity",
        font: "/medias/screen-5-double-line/Font/Font",
        fontSize: "/medias/screen-5-double-line/Font/Font_Size",
      },
    },
  },
} as {
  addresses: { [key: string]: ScreenAddresses };
  screens: string[];
};

// as {
//   [key: string]:
//     | {
//         [key: string]: ScreenAddresses;
//       }
//     | string[];
// };
