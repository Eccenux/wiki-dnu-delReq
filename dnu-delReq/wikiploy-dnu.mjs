/**
 * Dev/staging deploy.
 */
// import { setupSummary } from 'wikiploy';
import { DeployConfig, Wikiploy } from 'wikiploy';

import * as botpass from '../bot.config.mjs';
const ployBot = new Wikiploy(botpass);

// default site
// ployBot.site = "meta.wikimedia.org"; 

(async () => {
	// custom summary from a prompt
	// await setupSummary(ployBot);
	ployBot.summary = () => {
		return `basic mobile support`;
		// return `underscore and api safety`;
	};

	// deploy
	const configs = [];
	configs.push(new DeployConfig({
		src: 'dnu-delReq/Gadget-DelReqHandler.js',
		dst: '~/DelReqHandler.js',
	}));
	// configs.push(new DeployConfig({
	// 	src: 'dnu-delReq/Gadget-DelReqHandler.js',
	// 	dst: 'MediaWiki:Gadget-DelReqHandler.js',
	// }));
	await ployBot.deploy(configs);
})().catch(err => {
	console.error(err);
	process.exit(1);
});