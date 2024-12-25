#!/usr/bin/env node
const fs = require('fs');

const FREQS_BY_10 = [
  250, 260, 270, 280, 290,
  300, 310, 320, 330, 340,
  350, 360, 370, 380, 390,
  400, 410, 420, 430, 440,
  450, 460, 470, 480, 490
];

const NOTCHES = [
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

const outer_circle_svg = `<g id="outer"><circle cx="0" cy="0" r="74" stroke="black" stroke-width=".25" fill="white" id="circle2" style="fill:#eee;" />`
  + FREQS_BY_10.flatMap(
    (freq) => NOTCHES.map(o => notch_on_outer_circle(o.length, freqToAngle(freq + o.delta)))
  ).join('')
  + FREQS_BY_10.map((freq) => text_on_outer_circle(freq, freqToAngle(freq))).join('') + `</g>`;


const inner_circle_svg = () => {

  const o = { exterior: 39, interior: 26 };
  const window = `M 0,-${o.interior} L 0,-${o.exterior} A ${o.exterior} ${o.exterior} 0 0 0 -${o.exterior * Math.SQRT1_2},-${o.exterior * Math.SQRT1_2} L -${o.interior * Math.SQRT1_2},-${o.interior * Math.SQRT1_2} A ${o.interior} ${o.interior} 0 0 1 0,-${o.interior}`;

  return `<g id="inner"><path fill="white" fill-rule="evenodd" d="M 0,-60 A 60 60 0 0 1 0,60 A 60 60 0 0 1 0,-60 ${window}" transform="rotate(22.5)" />`
    + FREQS_BY_10.flatMap(
      (freq) => NOTCHES.map(o => notch_on_inner_circle(o.length, freqToAngle(freq + o.delta)))
    ).join('')
    + FREQS_BY_10.map((freq) => text_on_inner_circle(freq, freqToAngle(freq))).join('')
    + Array.from({ length: 12 }, (_, i) => text({
      radius: 45, angle: i * 30, content: [
        'A', 'A♯/B♭', 'B', 'C', 'C♯/D♭', 'D',
        'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭'
      ][i]
    })).join('')
    + `</g>`;
}



fs.writeFileSync('gen.svg', `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg version="1.1" viewBox="-80 -80 160 160">`+
  outer_circle_svg
  + inner_circle_svg()
  + `</svg>
`, { encoding: 'utf-8' });

function freqToAngle(freq) { return Math.log2(freq / 440) * 360; }

function text({ content, angle, radius }) {
  return `<text
     xml:space="preserve"
     style="font-size:7.5px;line-height:1.2;font-family:sans-serif;-inkscape-font-specification:sans-serif;text-align:center;text-decoration-color:#000000;text-anchor:middle;white-space:pre;fill:#000000;stroke:none;"
     x="0"
     y="-54"
     id="text1" transform="rotate(${angle})"><tspan
       sodipodi:role="line"
       id="tspan1"
       x="-0.28545514"
       y="${-radius}"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:4px;font-family:Garamond;-inkscape-font-specification:Garamond;text-align:center;text-anchor:middle">${content}</tspan></text>`;
}

function text_on_inner_circle(content, angle) {
  return text({ content, angle, radius: 52 });
}

function text_on_outer_circle(content, angle) {
  return text({ content, angle, radius: 65 });
}

function notch_on_inner_circle(length, angle) {
  return `<path
     style="fill:#ffffff;fill-opacity:0.5;stroke:#000000;stroke-width:0.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none" transform="rotate(${angle})"
     d="m 0,-60 v ${length}"
     id="path2"
     sodipodi:nodetypes="cc" />`;
}

function notch_on_outer_circle(length, angle) {
  return `<path
     style="fill:#ffffff;fill-opacity:0.5;stroke:#000000;stroke-width:0.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none" transform="rotate(${angle})"
     d="m 0,-60 v ${-length}"
     id="path2"
     sodipodi:nodetypes="cc" />`;
}
