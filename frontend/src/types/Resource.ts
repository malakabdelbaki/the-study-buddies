import { Types } from "mongoose";

export type Resource = {
    module_id?: Types.ObjectId;
    isOutdated? :boolean;
    title?:string;
    description?:string;
    type?:string;
    url?:string;
}