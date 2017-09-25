# Collegram

This app is still in very early dev so things are not setup for proper usage/distribution please beware.
Collegram is an experimental percussive synthesizer made with javascript.

### Concept of the application

* Hide as much parameters from the user as possible.
* Make heavy use of random based generative approach for sound synthesis.
* The system should make it easy to navigate a wide range of sonic experiences very fast.
* Reduce the amount of technical investment from the user for producing interesting sonic ideas.

## Getting Started

```
cd to your app folder
npm start 
```
### Prerequisites

```
install node.js 
npm install electron --save-dev
npm install soundbank-reverb
```
### How To Use

* !!!watch out for the volume if using headphones no master volume control!!!
* play button to start playback
* stop button to stop playback
* randomise button creates a new set of sounds

### TODO

* fine tune synthesis chain and parameter generation for a wide range of exotic percussion sounds.
* create a more interesting sequencer
* add snapshot system that can save set of sound and set of rythms independently.
* add .wav export function.
* create a pleasing UI.