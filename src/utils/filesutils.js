import { Buffer } from 'buffer';
import { createHash } from "crypto";
import axios from 'axios';

export function _base64ToArrayBuffer(base64) {
    return Uint8Array.from(Buffer.from(base64, 'base64').toString("binary"), c => c.charCodeAt(0))
}
export function arrayToBase64(buffer ) {
    let u8 = new Uint8Array(buffer);
    let b64 = Buffer.from(u8).toString('base64');
    return b64;
}
export const  calculateChecksum = (byteArray) =>
{
    let hash = createHash("sha256").update(byteArray).digest("hex").toString();
    return hash;
}
export async function getBase64String(file) {
    const temporaryFileReader = new FileReader();
    temporaryFileReader.readAsDataURL(file);
  
    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
  
      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
    });
  }
export async function getFileData (file){
    let fileCharacters = file.name.split(".");
    let fileName = fileCharacters[0];
    let fileExt = fileCharacters.slice(-1)[0];
    let fileBase64String = await getBase64String(file);
    return {fileName, fileExt, base64:fileBase64String.split(",")[1]}
}
export function getMIMETypeFromFileType(fileType) {
  const fileTypeMap = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    txt: "text/plain",
    csv: "text/csv",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
  };

  const mime = fileTypeMap[fileType.toLowerCase()];
  return mime || "application/octet-stream"; 
}
export function getMaxFileSize(extension, bytes) {
  const fileSizeInKB = bytes;
  switch (extension) {
    case "txt":
      return Math.min(102400, fileSizeInKB);
    case "jpg":
    case "png":
    case "gif":
      return Math.min(1048576, fileSizeInKB);
    case "mp3":
    case "wav":
      return Math.min(5242880, fileSizeInKB);
    case "mp4":
    case "avi":
      return Math.min(52428800, fileSizeInKB);
    case "pdf":
      return Math.min(2097152, fileSizeInKB);
    default:
      return Math.min(512000, fileSizeInKB);
  }
}
export const uploadPublicFile = async (file) =>{
  const {fileName, fileExt, base64} = await getFileData(file);
  try{
  const bytesLength = 16384*4; //Max server size
  const stringChunkSize = parseInt((bytesLength * 4)/3);
  const fileId = crypto.randomUUID();
  const fileTotalByteSize = _base64ToArrayBuffer(base64).length;
  let numChunks = parseInt(base64.length/stringChunkSize);
  let remainder = base64.length%stringChunkSize;
  let index     = 0;
  if(remainder>0) 
    ++numChunks;
  while (index < numChunks){
    const startIndex = stringChunkSize * index;
    const endIndex = stringChunkSize * (index + 1);
    const chunk = base64.slice(startIndex, endIndex);
    await axios('/api/files/chunks',{
      method : "POST",
      data : {
        fileId: fileId,
        number: index,
        data: chunk,
        size: _base64ToArrayBuffer(chunk).length,
        fileSize: fileTotalByteSize,
        type: fileExt,
        fileName: fileName
      }
    })
    ++index;
  }
  const picture = await axios(`/api/files/upload-public/${fileId}`,{
    method : "POST"
  });
  return picture.data;
  }
  catch(e){
    console.log(e)
    return {
      error : "Failed to change image"
    }
  
  }
}