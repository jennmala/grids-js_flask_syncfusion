import { getFeatures, changeOrder, addToSprint, removeFromSprint } from "./apiService.js";


const renderFeatures = async () => {
    const features = await getFeatures();
    console.log(features);
    const productBacklogList = features.filter((feature) => feature.version==='product backlog');
    const sprintBacklogList = features.filter((feature) => feature.version==='sprint backlog');

    ej.grids.Grid.Inject(ej.grids.Selection, ej.grids.RowDD);

    let productBacklog = new ej.grids.Grid(
        {
            dataSource: productBacklogList,
            allowRowDragAndDrop: true,
            selectionSettings: { type: 'Multiple' },
            rowDropSettings: { dropTargetID: 'sprintBacklog' },
            height: 400,
            width: '49%',
            columns: [
                { field: 'id', headerText: 'ID', isPrimaryKey: true, width: 80, textAlign: 'Left' },
                { field: 'type', headerText: 'Type', width: 130, textAlign: 'Left' },
                { field: 'title', headerText: 'Title', width: 130, textAlign: 'Left' },                
                { field: 'status', headerText: 'Status', width: 100, textAlign: 'Left' }, 
                { field: 'version', headerText: 'Version', width: 130, textAlign: 'Left' },
                // { field: 'order', headerText: 'order', width: 170, textAlign: 'Left' },
            ],
            rowDrop: async function (args) {
                console.log('args', args);
                console.log('from', args.fromIndex);
                console.log('to', args.dropIndex);
                console.log('data', args.data[0]);
                const currentId = args.data[0].id;

                if (args.target.offsetParent.id.includes('sprintBacklog')) {
                    console.log('add to sprint')
                    const data = {
                        id: args.data[0].id,
                        version: 'sprint backlog',
                    }
                    addToSprint(data);
                    return
                }

                if (args.fromIndex === args.dropIndex) {
                    console.log('equal');
                    return
                }


                if (args.fromIndex > args.dropIndex) {
                    console.log('move high');

                    let fetchData = [
                        { id: currentId, order: args.dropIndex },
                    ]

                    for (let i = args.fromIndex-1; i >= args.dropIndex; i = i-1) {
                        const feature = productBacklogList.find((feature) => feature.order === i);
                        const featureData = {
                            id: feature.id, 
                            order: i + 1,
                        }
                        fetchData.push(featureData);
                    }
                    changeOrder(fetchData);
                }


                if (args.fromIndex < args.dropIndex ) {
                    console.log('move low')

                    let fetchData = [
                        { id: currentId, order: args.dropIndex },
                    ]

                    for (let i = args.fromIndex+1; i <= args.dropIndex; i = i+1) {
                        const feature = await productBacklogList.find((feature) => feature.order === i);
                        console.log(feature)
                        const featureData = {
                            id: feature.id, 
                            order: i - 1,
                        }
                        fetchData.push(featureData);
                    }
                    changeOrder(fetchData);

                }
            }
        });

    productBacklog.appendTo('#productBacklog');


    let sprintBacklog = new ej.grids.Grid(
        {
            dataSource: sprintBacklogList,
            allowRowDragAndDrop: true,
            selectionSettings: { type: 'Multiple' },
            rowDropSettings: { targetID: 'productBacklog' },
            height: 400,
            width: '49%',
            columns: [
                { field: 'id', headerText: 'ID', isPrimaryKey: true, width: 80, textAlign: 'Left' },
                { field: 'type', headerText: 'Type', width: 130, textAlign: 'Left' },
                { field: 'title', headerText: 'Title', width: 130, textAlign: 'Left' },                
                { field: 'status', headerText: 'Status', width: 100, textAlign: 'Left' }, 
                { field: 'version', headerText: 'Version', width: 130, textAlign: 'Left' },
                // { field: 'order', headerText: 'order', width: 170, textAlign: 'Left' },
            ],
            rowDrop: async function (args) {
                console.log('args', args);
                console.log('from', args.fromIndex);
                console.log('to', args.dropIndex);
                console.log('data', args.data[0]);
                const currentId = args.data[0].id;

                if (args.target.offsetParent.id.includes('productBacklog')) {
                    console.log('return to product backlog')
                    const data = {
                        id: currentId,
                        version: 'product backlog',
                    }
                    removeFromSprint(data);
                    return
                }
            }
        });

    sprintBacklog.appendTo('#sprintBacklog');
}

renderFeatures();