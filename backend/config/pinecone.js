import { Pinecone} from "@pinecone-database/pinecone";
import { PINECONE_API_KEY, PINECONE_INDEX_NAME } from "./env.js";

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const indexModel = await pc.describeIndex( PINECONE_INDEX_NAME );
const index = pc.index({host: indexModel.host});

export default index;