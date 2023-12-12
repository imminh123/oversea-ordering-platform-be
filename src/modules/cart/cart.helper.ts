import { getConfig } from '../../shared/config/config.provider';

export const setConfigCacheTime = getConfig().get('setConfigCacheTime');
