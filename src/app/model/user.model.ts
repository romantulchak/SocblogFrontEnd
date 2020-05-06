import { Post } from './post.model';

export class User{
    id?: number;
    firstName:string;
    lastName:string;
    city?:string;
    avatar?:string;
    birthDay?:Date;
    username: string;
    placeOfWork?: string;
    gender?: string;
    country?:string;
    password: string;
    isNew?: boolean;
    email?: string;
    roles?: string[];
    posts?: Post[];
}