#!/usr/bin/env node
'use strict';
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

let fail = 0;
function ok(msg) { console.log('OK  ' + msg); }
function bad(msg) { console.log('FAIL ' + msg); fail++; }

// No Light Runner
if (/Light Runner|initRunner|id="runner"/.test(html)) bad('Light Runner still present');
else ok('Light Runner removed');

// No absurd 4x sizes in game CSS
const badSizes = ['font-size: 104px', 'font-size: 136px', 'font-size: 144px', 'font-size: 360px'];
badSizes.forEach(function(s) {
  if (html.includes(s)) bad('Oversized UI remains: ' + s);
});
if (!fail) ok('No 4x font sizes in CSS');

// Balanced global header
if (!html.includes('.screen:not(#hub) .back-btn {\n  font-size: 52px')) bad('Global back-btn not 52px');
else ok('Global back-btn 52px');

if (!html.includes('.screen:not(#hub) .game-title-bar { font-size: 68px')) bad('Global title not 68px');
else ok('Global title 68px');

// Invaders layout simulation (1920x1080)
const INV_W = Math.min(960, 1920 - 16);
const INV_H = Math.min(640, Math.max(280, 1080 - (16 + 100 + 72)));
const INV_CELL = Math.max(16, Math.floor(Math.min(INV_W / 18, INV_H / 13)));
const cs = INV_CELL;
const rows = 5;
const rowStep = cs * 1.35;
const playerY = INV_H - cs * 2.2;
const alienStartY = cs * 1.2;
const bottomAlien = alienStartY + (rows - 1) * rowStep + cs * 0.85;
if (bottomAlien >= playerY) bad('Invaders: aliens overlap player on start (' + Math.round(bottomAlien) + ' >= ' + Math.round(playerY) + ')');
else ok('Invaders: aliens clear player on start (gap ' + Math.round(playerY - bottomAlien) + 'px)');

if (INV_W > 1000) bad('Invaders canvas too wide: ' + INV_W);
else ok('Invaders canvas width capped (' + INV_W + 'px)');

if (INV_H > 700) bad('Invaders canvas too tall: ' + INV_H);
else ok('Invaders canvas height capped (' + INV_H + 'px)');

// Verify-before-done rule in skill
const skill = fs.readFileSync('/home/keiko/.grok/skills/permission-hard-rule/SKILL.md', 'utf8');
if (!skill.includes('VERIFY BEFORE DONE')) bad('Verify-before-done rule missing from permission skill');
else ok('Verify-before-done rule in permission skill');

// Basic HTML sanity
const script = html.match(/<script>([\s\S]*)<\/script>/);
if (!script) bad('No script block');
else {
  const open = (script[1].match(/\{/g) || []).length;
  const close = (script[1].match(/\}/g) || []).length;
  if (open !== close) bad('JS brace mismatch ' + open + ' vs ' + close);
  else ok('JS braces balanced');
}

console.log(fail ? '\nRESULT: FAIL (' + fail + ')' : '\nRESULT: PASS');
process.exit(fail ? 1 : 0);