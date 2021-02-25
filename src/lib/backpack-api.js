import xhr from 'xhr';
import costumePayload from './backpack/costume-payload';
import soundPayload from './backpack/sound-payload';
import spritePayload from './backpack/sprite-payload';
import codePayload from './backpack/code-payload';

const LOCALSTORAGE_KEY = '[eyangicques] backpack'

const randomId = () => {
    let str = '';
    for (let i = 0; i < 20; i++) {
        str += Math.floor(Math.random() * 36).toString(36);
    }
    return str;
}

// Add a new property for the full thumbnail url, which includes the host.
// Also include a full body url for loading sprite zips
// TODO retreiving the images through storage would allow us to remove this.
const includeFullUrls = (item, host) => Object.assign({}, item, {
//    thumbnailUrl: `${host}/${item.thumbnail}`,
//    bodyUrl: `${host}/${item.body}`

    body: `${item.id}.${item.mime.match(/\/(\w+)/)[1]}`,
    thumbnailUrl: `data:image/jpeg;base64,${item.thumbnail}`,
    bodyUrl: `data:${item.mime};base64,${item.body}`
});

const getBackpackContents = ({
    host,
    username,
    token,
    limit,
    offset
}) => new Promise((resolve, reject) => {
/*
    xhr({
        method: 'GET',
        uri: `${host}/${username}?limit=${limit}&offset=${offset}`,
        headers: {'x-token': token},
        json: true
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject();
        }
        return resolve(response.body.map(item => includeFullUrls(item, host)));
    });
*/
    const backpack = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]') || [];
    resolve(backpack.slice(offset, offset + limit).map(item => includeFullUrls(item, host)));
});

const saveBackpackObject = ({
    host,
    username,
    token,
    type, // Type of object being saved to the backpack
    mime, // Mime-type of the object being saved
    name, // User-facing name of the object being saved
    body, // Base64-encoded body of the object being saved
    thumbnail // Base64-encoded JPEG thumbnail of the object being saved
}) => new Promise((resolve, reject) => {
/*
    xhr({
        method: 'POST',
        uri: `${host}/${username}`,
        headers: {'x-token': token},
        json: {type, mime, name, body, thumbnail}
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject();
        }
        return resolve(includeFullUrls(response.body, host));
    });
*/
    const backpack = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]') || [];
    const newEntry = {
      type,
      mime,
      name,
      body,
      thumbnail,
      id: randomId()
    };
    backpack.splice(0, 0, newEntry);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(backpack));
    resolve(includeFullUrls(newEntry, host));
});

const deleteBackpackObject = ({
    host,
    username,
    token,
    id
}) => new Promise((resolve, reject) => {
/*
    xhr({
        method: 'DELETE',
        uri: `${host}/${username}/${id}`,
        headers: {'x-token': token}
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject();
        }
        return resolve(response.body);
    });
*/

    const backpack = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]') || [];
    const index = backpack.findIndex(entry => entry.id === id);
    if (index >= 0) {
      backpack.splice(index, 1);
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(backpack));
    }
    resolve({ok: true});
});

// Two types of backpack items are not retreivable through storage
// code, as json and sprite3 as arraybuffer zips.
const fetchAs = (responseType, uri) => new Promise((resolve, reject) => {
    xhr({uri, responseType}, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject();
        }
        return resolve(response.body);
    });
});


const getBackpackObjectById = id => {
    const backpack = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]') || [];
    return backpack.find(entry => entry.id === id);
};


// These two helpers allow easy fetching of backpack code and sprite zips
// Use the curried fetchAs here so the consumer does not worry about XHR responseTypes
const fetchCode = fetchAs.bind(null, 'json');
const fetchSprite = fetchAs.bind(null, 'arraybuffer');

export {
    getBackpackContents,
    saveBackpackObject,
    deleteBackpackObject,
    getBackpackObjectById,
    costumePayload,
    soundPayload,
    spritePayload,
    codePayload,
    fetchCode,
    fetchSprite
};
