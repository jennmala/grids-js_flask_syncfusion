import { getFeatures, changeOrder } from "./apiService.js";


const renderFeatures = async () => {
    const features = await getFeatures();
    console.log(features);

    ej.grids.Grid.Inject(ej.grids.Selection, ej.grids.RowDD);

    let productBacklog = new ej.grids.Grid(
        {
            dataSource: features,
            allowRowDragAndDrop: true,
            selectionSettings: { type: 'Multiple' },
            height: 400,
            columns: [
                { field: 'id', headerText: 'ID', isPrimaryKey: true, width: 80, textAlign: 'Left' },
                { field: 'type', headerText: 'Type', width: 130, textAlign: 'Left' },
                { field: 'title', headerText: 'Title', width: 130, textAlign: 'Left' },                
                { field: 'status', headerText: 'Status', width: 100, textAlign: 'Left' }, 
                { field: 'version', headerText: 'Version', width: 130, textAlign: 'Left' },
                { field: 'order', headerText: 'order', width: 170, textAlign: 'Left' },
            ],
            rowDrop: async function (args) {
                console.log('args', args);
                console.log('from', args.fromIndex);
                console.log('to', args.dropIndex);
                const currentId = args.data[0].id;


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
                        const feature = features.find((feature) => feature.order === i);
                        const featureData = {
                            id: feature.id, order: i + 1
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
                        const feature = features.find((feature) => feature.order === i);
                        const featureData = {
                            id: feature.id, order: i - 1
                        }
                        fetchData.push(featureData);
                    }
                    changeOrder(fetchData);

                }
            }
        });
        
        productBacklog.appendTo('#root');
}

renderFeatures();