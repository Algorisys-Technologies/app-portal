// import { api, Header } from "encore.dev/api";

// interface GetPostsRequest {
//   language: Header<"Accept-Language">; // parsed from header
//   author: string;
// }

// interface GetPostsResponse {
//   success: boolean;
//   message: string;
// }

// export const getPosts = api<GetPostsRequest, GetPostsResponse>(
//   {
//     method: "GET",
//     path: "/api/posts",
//     expose: true,
//   },
//   async (request): Promise<GetPostsResponse> => {
//     const { language, author } = request;

//     // Example logic for processing the request
//     // Fetch posts based on `author` and `language`
    
//     return {
//       success: true,
//       message: `Fetched posts for author ${author} and language ${language}.`,
//     };
//   }
// );
