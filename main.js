const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadMP4FilesFromIPFS(folderCID, downloadDirectory) {
    try {
        // Fetch the folder contents from IPFS
        const response = await axios.get(`https://ipfs.io/ipfs/${folderCID}`);

        // Filter out the .mp4 files
        const mp4Files = response.data.Objects[0].Links.filter(file => file.Name.endsWith('.mp4'));

        // Download each .mp4 file
        for (const file of mp4Files) {
            const fileCID = file.Hash;
            const fileName = file.Name;

            // Fetch the .mp4 file content
            const fileResponse = await axios.get(`https://ipfs.io/ipfs/${fileCID}`, {
                responseType: 'stream'
            });

            // Create a writable stream to save the file
            const filePath = path.join(downloadDirectory, fileName);
            const writer = fs.createWriteStream(filePath);

            // Pipe the file content to the writable stream
            fileResponse.data.pipe(writer);

            // Wait for the file to be written completely
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            console.log(`Downloaded ${fileName}`);
        }

        console.log('All MP4 files downloaded successfully!');
    } catch (error) {
        console.error('Error downloading MP4 files from IPFS:', error.message);
    }
}

// Example usage:
const folderCID = 'QmVLJEV8dzRjHKjgSkg4TdY9s48ru3ZSbvZt2z9UvM1VEK';
const downloadDirectory = './downloads'; // Directory where the files will be saved
downloadMP4FilesFromIPFS(folderCID, downloadDirectory);
