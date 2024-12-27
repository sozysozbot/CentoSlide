#!/usr/bin/env node
const fs = require('fs');

const FREQS_BY_10 = [
  250, 260, 270, 280, 290,
  300, 310, 320, 330, 340,
  350, 360, 370, 380, 390,
  400, 410, 420, 430, 440,
  450, 460, 470, 480, 490
];

const NOTCHES_FREQ = [
  { delta: 0, length: 3.9 },
  { delta: 1, length: 2 },
  { delta: 2, length: 2 },
  { delta: 3, length: 2 },
  { delta: 4, length: 2 },
  { delta: 5, length: 3.9 },
  { delta: 6, length: 2 },
  { delta: 7, length: 2 },
  { delta: 8, length: 2 },
  { delta: 9, length: 2 },
  { delta: 0.5, length: 1.4 },
  { delta: 1.5, length: 1.4 },
  { delta: 2.5, length: 1.4 },
  { delta: 3.5, length: 1.4 },
  { delta: 4.5, length: 1.4 },
  { delta: 5.5, length: 1.4 },
  { delta: 6.5, length: 1.4 },
  { delta: 7.5, length: 1.4 },
  { delta: 8.5, length: 1.4 },
  { delta: 9.5, length: 1.4 },
];

const WINDOW_RADIUS = { top_edge: 39, bottom_edge: 26 };

const getNotchCentLength = (delta) => {
  if (delta % 50 === 0) {
    return 3.9;
  } else if (delta % 10 === 0) {
    return 2;
  } else {
    return 1.4;
  }
}

function g(id, svg) { return `<g id="${id}">${svg}</g>` }

const outer_plate_svg = () => {
  return `<g id="outer_plate"><circle cx="0" cy="0" r="74" stroke="black" stroke-width=".25" fill="white" id="circle2" style="fill:#eee;" />`
    + g("outer_plate_freq_notches", FREQS_BY_10.flatMap(
      (freq) => NOTCHES_FREQ.map(o => notch_on_outer_plate(o.length, freqToAngle(freq + o.delta)))
    ).join(''))
    + g("outer_plate_freq_texts", FREQS_BY_10.map((freq) => text_on_outer_plate(freq, freqToAngle(freq))).join(''))
    + g("outer_plate_cent_notches", Array.from({ length: 600 }).map((_, i) => notch_on_window_top_edge(getNotchCentLength(i * 2), (i * 2) * 360 / 1200)).join(''))
    + g("outer_plate_cent_texts", text_on_window_top_edge('±0¢', 0)
      + text_on_window_top_edge('±600¢', 180)
      + Array.from({ length: 11 }, (_, i) => text_on_window_top_edge(`+${(i + 1) * 50}¢`, (i + 1) * 15)).join('')
      + Array.from({ length: 11 }, (_, i) => text_on_window_top_edge(`&#x2212;${(i + 1) * 50}¢`, -(i + 1) * 15)).join('')
    )
    + `</g>`;
}

const inner_plate_svg = () => {
  const { top_edge: top, bottom_edge: bottom } = WINDOW_RADIUS;

  const window = `M 0,-${bottom} L 0,-${top} A ${top} ${top} 0 0 0 -${top * Math.SQRT1_2},-${top * Math.SQRT1_2} L -${bottom * Math.SQRT1_2},-${bottom * Math.SQRT1_2} A ${bottom} ${bottom} 0 0 1 0,-${bottom}`;

  const PLATE_ANGLE = 2.4;

  return `<g id="inner_plate" transform="rotate(${PLATE_ANGLE})"><path fill="white" fill-rule="evenodd" d="M 0,-60 A 60 60 0 0 1 0,60 A 60 60 0 0 1 0,-60 ${window}" transform="rotate(22.5)" />`
    + g("inner_plate_freq_notches", FREQS_BY_10.flatMap(
      (freq) => NOTCHES_FREQ.map(o => notch_on_inner_plate(o.length, freqToAngle(freq + o.delta)))
    ).join(''))
    + g("inner_plate_freq_texts", FREQS_BY_10.map((freq) => text_on_inner_plate(freq, freqToAngle(freq))).join(''))
    + g("inner_plate_note_texts", Array.from({ length: 12 }, (_, i) => text({
      radius: 45, angle: i * 30, content: [
        'A', 'A♯/B♭', 'B', 'C', 'C♯/D♭', 'D',
        'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭'
      ][i]
    })).join(''))
    + g("credit",
      text({ content: 'CentoSlide', angle: 0, radius: 13, size: 5 }) +
      text({ content: 'Designed by @hsjoihs', angle: 0, radius: 8, size: 3 })
    )
    + g("indicator", notch_on_window_top_edge_pointing_out(2, 0))
    + `</g>`;
}

const svg_file =
  `<svg width="160mm" height="160mm" viewBox="-80 -80 160 160" version="1.1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="shinyGold" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:#ffd700; stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8d7802; stop-opacity:1" />
    </radialGradient>
    <filter id="glossy">
      <feSpecularLighting result="specOut" specularExponent="30" lighting-color="#ffffff">
        <fePointLight x="-5000" y="-10000" z="20000" />
      </feSpecularLighting>
      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
    </filter>
  </defs>`+
  outer_plate_svg()
  + inner_plate_svg()
  + `<circle cx="0" cy="0" r="3.3" stroke="#8d7802" stroke-width="1" fill="url(#shinyGold)" filter="url(#glossy)" id="center_eyelet" /></svg>
`;

fs.writeFileSync('docs/octave.svg', svg_file, { encoding: 'utf-8' });
fs.writeFileSync('docs/octave.html',
  fs.readFileSync('template.html', { encoding: 'utf-8' })
    .replace('{{svg_content}}', svg_file)
    .replace('{{title}}', 'octave'),
  { encoding: 'utf-8' }
);

function freqToAngle(freq) { return Math.log2(freq / 440) * 360; }

function text({ content, angle, radius, size = 4 }) {
  return `<text
     xml:space="preserve"
     style="font-size:${size}px;line-height:1.2;font-family:sans-serif;-inkscape-font-specification:sans-serif;text-align:center;text-decoration-color:#000000;text-anchor:middle;white-space:pre;fill:#000000;stroke:none;"
     x="0"
     y="${-radius}"
     id="text1" transform="rotate(${angle})"><tspan
       sodipodi:role="line"
       id="tspan1"
       x="-0.28545514"
       y="${-radius}"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:${size}px;font-family:Garamond, 'Times New Roman', Consolas, serif;-inkscape-font-specification:Garamond, 'Times New Roman', Consolas, serif;text-align:center;text-anchor:middle">${content}</tspan></text>`;
}

function text_on_inner_plate(content, angle) {
  return text({ content, angle, radius: 52 });
}

function text_on_outer_plate(content, angle) {
  return text({ content, angle, radius: 65 });
}

function text_on_window_top_edge(content, angle) {
  return text({ content, angle, radius: 32, size: 3 });
}

function notch({ radius, length, angle, is_pointing_inward }) {
  return `<path
     style="fill:#ffffff;fill-opacity:0.5;stroke:#000000;stroke-width:0.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none"
     d="m 0,${-radius} v ${is_pointing_inward ? length : -length}"
     sodipodi:nodetypes="cc" transform="rotate(${angle})" />`;
}

function notch_on_inner_plate(length, angle) {
  return notch({ radius: 60, length, angle, is_pointing_inward: true });
}

function notch_on_window_top_edge(length, angle) {
  return notch({ radius: WINDOW_RADIUS.top_edge, length, angle, is_pointing_inward: true });
}

function notch_on_window_top_edge_pointing_out(length, angle) {
  return notch({ radius: WINDOW_RADIUS.top_edge, length, angle, is_pointing_inward: false });
}

function notch_on_outer_plate(length, angle) {
  return notch({ radius: 60, length, angle, is_pointing_inward: false });
}
