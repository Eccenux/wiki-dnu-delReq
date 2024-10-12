import { DeployConfig } from 'wikiploy';

/**
 * Add config.
 * @param {Array} configs DeployConfig array.
 * @param {String} site Domian of a MW site.
 */
export function addConfig(configs, site, isRelease) {
	let deploymentName = isRelease ? 'MediaWiki:Gadget-DelReqHandler' : '~/DelReqHandler';
	configs.push(new DeployConfig({
		src: 'Gadget-DelReqHandler.js',
		dst: `${deploymentName}.js`,
		site,
		nowiki: false,
	}));
	// configs.push(new DeployConfig({
	// 	src: 'DelReqHandler.css',
	// 	dst: `${deploymentName}.css`,
	// 	site,
	// }));
}
export function addConfigRelease(configs, site) {
	addConfig(configs, site, true);
}
