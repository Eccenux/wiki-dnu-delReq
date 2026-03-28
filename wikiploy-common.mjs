import { DeployConfig } from 'wikiploy';

/**
 * Add config.
 * @param {Array} configs DeployConfig array.
 * @param {String} site Domian of a MW site.
 */
export function addConfig(configs, site, isRelease) {
	let deploymentPrefix = isRelease ? 'MediaWiki:Gadget-' : '~/';
	configs.push(new DeployConfig({
		src: 'Gadget-DelReqHandler.js',
		dst: `${deploymentPrefix}DelReqHandler.js`,
		site,
		nowiki: false,
	}));
	configs.push(new DeployConfig({
		src: 'DelReqHandler.css',
		dst: `${deploymentPrefix}DelReqHandler.css`,
		site,
	}));
	configs.push(new DeployConfig({
		src: 'SimpleDragDialog.js',
		dst: `${deploymentPrefix}SimpleDragDialog.js`,
		site,
	}));
	configs.push(new DeployConfig({
		src: 'SimpleDragDialog.css',
		dst: `${deploymentPrefix}SimpleDragDialog.css`,
		site,
	}));
}
export function addConfigRelease(configs, site) {
	addConfig(configs, site, true);
}
