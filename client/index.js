import { getFeatures } from './apiService.js';
import { renderProductBacklog, renderSprintBacklog } from './renderGridsService.js';
import { camelize } from './utils.js';



const features = await getFeatures();
console.log(features);

const getSprintsNamesObject = (features) => {
    const versionsNames = features.map(feature => feature.version);
    const uniqueSprintsNames = [...new Set(versionsNames)].filter(name => name !== 'product backlog').sort();
    const obj = {}
    uniqueSprintsNames.forEach(name => obj[camelize(name)] = name);
    return obj;
}
const sprintsNamesObj = getSprintsNamesObject(features);


renderProductBacklog(features, sprintsNamesObj);

Object.values(sprintsNamesObj).forEach((sprintName) => {
    renderSprintBacklog(features, sprintName, sprintsNamesObj);
})
