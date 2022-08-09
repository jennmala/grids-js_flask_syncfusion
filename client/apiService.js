const BASE_URL = 'http://127.0.0.1:5000';


export const getFeatures = async () => {
    const response = await fetch(`${BASE_URL}/features`);
        if (!response.ok) {
            console.log('ERROR');
            return Promise.reject(new Error('Something was wrong'));            
        }
            const reader = response.body.getReader();

            const stream = new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            controller.enqueue(value);
                            push();
                        })
                    }
                    push();
                }
            })
        
            const result = await new Response(stream, {headers: { 'Content-Type': 'application/json'}}).json();

            return result.results;
}

export const changeOrder = async (data) => {
    const response = await fetch(`${BASE_URL}/features`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        body: JSON.stringify({ data: { orderedData: data } }),
      });
      
      console.log(response)
        if (!response.ok) {
            console.log('ERROR');
            return Promise.reject(new Error('Something was wrong'));            
        }
}

export const addToSprint = async (data) => {
    const response = await fetch(`${BASE_URL}/features`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        body: JSON.stringify({ data: { toSprint: data } }),
      });
      
      console.log(response)
        if (!response.ok) {
            console.log('ERROR');
            return Promise.reject(new Error('Something was wrong'));            
        }
} 

export const removeFromSprint = async (data) => {
    const response = await fetch(`${BASE_URL}/features`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        body: JSON.stringify({ data: { toProductBacklog: data } }),
      });
      
      console.log(response)
        if (!response.ok) {
            console.log('ERROR');
            return Promise.reject(new Error('Something was wrong'));            
        }
} 