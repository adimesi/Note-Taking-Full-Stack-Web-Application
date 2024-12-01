import React from "react";
import Page from "../components/page";
import axios from "axios";

const App = () => {
    return (
        <div>
          <Page />
        </div>
      );
};
export default App;
type PostType = {
    id: number;
    title: string;
    author: {
      name: string;
      email: string;
    }
    content: string;
  };

  
export async function getStaticProps() {
    const POSTS_PER_PAGE = 10;
    const NOTES_URL = "http://localhost:3001/notes";
    let totalOfPosts = 0;
    let activePage = 1;
    let posts: PostType[]=[];
    
    const count = axios.get("http://localhost:3001/document-count");
      count.then(response => {
        totalOfPosts=(Number(response.data));
      });
      const promise = axios.get(NOTES_URL, {
        params: {
          _page: activePage,
          _per_page: POSTS_PER_PAGE
        }
      });
      promise.then(response => {
        posts=(response.data);
      })
      .catch(err => {
        console.error(err);
      }); 

  return {
    props: {
      posts,
    },
  };
}