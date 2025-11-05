import Axios from 'axios';
import { createWriteStream, ReadStream } from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';

const finished = promisify(stream.finished);

export async function downloadFile(fileUrl: string, outputLocationPath: string): Promise<any> {
    const writer = createWriteStream(outputLocationPath);
    return Axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(async response => {
        response.data.pipe(writer);
        return finished(writer);
    });
}