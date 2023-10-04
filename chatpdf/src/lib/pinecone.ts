import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
    if (!pinecone) {
        await new Pinecone({
            environment: process.env.PINECONE_ENVIRONMENT!,
            apiKey: process.env.PINECONE_API_KEY!,
        })
    }
    return pinecone;
}

type PDFPage = {
    pageContent: string;
    metadata: {
      loc: { pageNumber: number };
    };
  };

export async function loadS3IntoPinecone(fileKey: string) {
    try {
        console.log("downloading s3 into file system");
        const file_name = await downloadFromS3(fileKey);
        if (!file_name) {
            throw new Error('could not download from s3');
        }
        
        console.log("loading pdf into memory " + file_name);
        const loader = new PDFLoader(file_name);
        const pages = (await loader.load()) as PDFPage[];
        return pages;

    } catch (error) {
        console.error("Error in loadS3IntoPinecone:", error);
        throw error; // Rethrow the error for further handling or debugging.
    }
}
