#!/usr/bin/env node
const fs = require('fs');

const FREQS_BY_5 = [
  415, 420, 425, 430, 435, 440, 445, 450, 455, 460
];

const FREQS_BY_1 = Array.from({ length: 465 - 415 + 1 }, (_, i) => i + 415);

const NOTCHES_FREQ = [
  { delta: 0, length: 3.9 },
  { delta: 1, length: 3.9 },
  { delta: 2, length: 3.9 },
  { delta: 3, length: 3.9 },
  { delta: 4, length: 3.9 },
  { delta: 0.2, length: 2 },
  { delta: 0.4, length: 2 },
  { delta: 0.6, length: 2 },
  { delta: 0.8, length: 2 },
  { delta: 1.2, length: 2 },
  { delta: 1.4, length: 2 },
  { delta: 1.6, length: 2 },
  { delta: 1.8, length: 2 },
  { delta: 2.2, length: 2 },
  { delta: 2.4, length: 2 },
  { delta: 2.6, length: 2 },
  { delta: 2.8, length: 2 },
  { delta: 3.2, length: 2 },
  { delta: 3.4, length: 2 },
  { delta: 3.6, length: 2 },
  { delta: 3.8, length: 2 },
  { delta: 4.2, length: 2 },
  { delta: 4.4, length: 2 },
  { delta: 4.6, length: 2 },
  { delta: 4.8, length: 2 },
  { delta: 0.1, length: 1.4 },
  { delta: 0.3, length: 1.4 },
  { delta: 0.5, length: 1.4 },
  { delta: 0.7, length: 1.4 },
  { delta: 0.9, length: 1.4 },
  { delta: 1.1, length: 1.4 },
  { delta: 1.3, length: 1.4 },
  { delta: 1.5, length: 1.4 },
  { delta: 1.7, length: 1.4 },
  { delta: 1.9, length: 1.4 },
  { delta: 2.1, length: 1.4 },
  { delta: 2.3, length: 1.4 },
  { delta: 2.5, length: 1.4 },
  { delta: 2.7, length: 1.4 },
  { delta: 2.9, length: 1.4 },
  { delta: 3.1, length: 1.4 },
  { delta: 3.3, length: 1.4 },
  { delta: 3.5, length: 1.4 },
  { delta: 3.7, length: 1.4 },
  { delta: 3.9, length: 1.4 },
  { delta: 4.1, length: 1.4 },
  { delta: 4.3, length: 1.4 },
  { delta: 4.5, length: 1.4 },
  { delta: 4.7, length: 1.4 },
  { delta: 4.9, length: 1.4 },
];

const WINDOW_RADIUS = { top_edge: 39, bottom_edge: 26 };

const getNotchCentLength = (delta) => {
  if (delta % 5 === 0) {
    return 3.9;
  } else if ((delta) % 1 === 0) {
    return 2;
  } else {
    return 1.4;
  }
}

function g(id, svg) { return `<g id="${id}">${svg}</g>` }

const outer_plate_svg = () => {
  return `<g id="outer_plate"><circle cx="0" cy="0" r="74" stroke="black" stroke-width=".25" fill="white" id="circle2" style="fill:#eee;" />`
    + g("outer_plate_freq_notches",
      FREQS_BY_5.flatMap(
        (freq) => NOTCHES_FREQ.map(o => notch_on_outer_plate(o.length, freqToAngle(freq + o.delta)))
      ).join('') + notch_on_outer_plate(3.9, freqToAngle(465))
    )
    + g("outer_plate_freq_texts",
      FREQS_BY_1.map((freq) => text(
        { content: freq, angle: freqToAngle(freq), radius: 65, size: freq % 5 === 0 ? 4 : 3 }
      )).join(''))
    + g("outer_plate_cent_notches", Array.from({ length: 200 }).map((_, i) => notch_on_window_top_edge(getNotchCentLength(i), i * 360 * 6 / 1200)).join(''))
    + g("outer_plate_cent_texts", text_on_window_top_edge('±0¢', 0)
      + Array.from({ length: 10 }, (_, i) => text_on_window_top_edge(`+${(i + 1) * 10}¢`, (i + 1) * 3 * 6)).join('')
      + Array.from({ length: 10 }, (_, i) => text_on_window_top_edge(`&#x2212;${(i + 1) * 10}¢`, -(i + 1) * 3 * 6)).join('')
    )
    + `</g>`;
}

const inner_plate_svg = () => {
  const { top_edge: top, bottom_edge: bottom } = WINDOW_RADIUS;

  const window = `M 0,-${bottom} L 0,-${top} A ${top} ${top} 0 0 0 -${top * Math.SQRT1_2},-${top * Math.SQRT1_2} L -${bottom * Math.SQRT1_2},-${bottom * Math.SQRT1_2} A ${bottom} ${bottom} 0 0 1 0,-${bottom}`;

  const PLATE_ANGLE = 20;

  return `<g id="inner_plate" transform="rotate(${PLATE_ANGLE})"><path fill="white" fill-rule="evenodd" d="M 0,-60 A 60 60 0 0 1 0,60 A 60 60 0 0 1 0,-60 ${window}" transform="rotate(22.5)" />`
    + g("inner_plate_freq_notches",
      FREQS_BY_5.flatMap(
        (freq) => NOTCHES_FREQ.map(o => notch_on_inner_plate(o.length, freqToAngle(freq + o.delta)))
      ).join('') + notch_on_inner_plate(3.9, freqToAngle(465))
    )
    + g("inner_plate_freq_texts",
      FREQS_BY_1.map(
        (freq) => text(
          { content: freq, angle: freqToAngle(freq), radius: 52, size: freq % 5 === 0 ? 3.5 : 2.5 }
        )
      ).join('')
    )
    + g("indicator", notch_on_window_top_edge_pointing_out(3.9, 0))
    + `</g>`;
}



const svg_file = `<svg width="160mm" height="160mm" viewBox="-80 -80 160 160" version="1.1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><defs>
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
fs.writeFileSync('docs/whole_tone.svg', svg_file, { encoding: 'utf-8' });
fs.writeFileSync('docs/whole_tone.html',
  fs.readFileSync('template.html', { encoding: 'utf-8' })
    .replace('{{svg_content}}', svg_file)
    .replace('{{title}}', 'whole tone'),
  { encoding: 'utf-8' }
);

function freqToAngle(freq) { return Math.log2(freq / 440) * 360 * 6; }

function text({ content, angle, radius, size = 3.5 }) {
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
  return text({ content, angle, radius: 32 });
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
