
export type Resource = {
    _id?:string
    module_id?: string;
    isOutdated? :boolean;
    title?:string;
    description?:string;
    type?:string;
    url?:string;
    updatedAt?:Date;
}