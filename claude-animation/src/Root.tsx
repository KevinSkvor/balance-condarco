import React from 'react';
import {Composition} from 'remotion';
import {T} from './lib';
import {Showreel} from './Showreel';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="ClaudeShowreel"
		component={Showreel}
		durationInFrames={T.durationInFrames}
		fps={T.fps}
		width={T.width}
		height={T.height}
	/>
);
