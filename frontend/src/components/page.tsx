"use client";
import React ,{useState, useEffect } from "react";
import "../css/pageStyle.css";
import axios from "axios";
const POSTS_PER_PAGE = 10;
const NOTES_URL = "http://localhost:3001/notes";

type noteType = {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
  }
  content: string;
};
 
export default function Page() {
  const [posts, setPosts] = useState<noteType[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [totalOfPosts, settotalOfPosts] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);
  const [addedContent, setAddedContent] = useState("");
  const [theme, setTheme] = useState("light");
  //
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null); // Adjust the type according to your user structure
  const [loginError, setLoginError] = useState("");
  const [token, setToken] = useState("");
  //caching the user data
  const [cachePosts, setCachePosts] = useState<{[pageNum :number]: noteType[]}>({});
  

  //preFetching 50 posts based on the active page
  useEffect(() => {
    const count = axios.get("http://localhost:3001/document-count");
    count.then(response => {
      settotalOfPosts(Number(response.data));
    });
    const pageNumbers= createPageNumbers();
    for(let page=pageNumbers[0]; page<=pageNumbers[pageNumbers.length-1]; page++){
      const promise = axios.get(NOTES_URL, {
        params: {
          _page: page,
          _per_page: POSTS_PER_PAGE
        }
      });
      promise.then(response => {
        setCachePosts((prevCachePosts) => {
          return {...prevCachePosts, [page]: response.data};
      })})
      .catch(err => {
        console.error(err);
      });
    }
    const loggedUserJson = window.localStorage.getItem("loggedUser");
    if (loggedUserJson) {
      const user = JSON.parse(loggedUserJson);
      setUser(user);
      setIsLoggedIn(true);
      const token = user.token;
      setToken(`Bearer ${token}`);
    }
  },[]);
 
  useEffect(() => {
    if(cachePosts[activePage]){
      setPosts(cachePosts[activePage]);
    }
    else{
      const promise = axios.get(NOTES_URL, {
        params: {
          _page: activePage,
          _per_page: POSTS_PER_PAGE
        }
      });
      promise.then(response => {
        setPosts(response.data);
      })
      .catch(err => {
        console.error(err);
      });
    }}, [activePage]);

  function handleNext() {
    const nextPage = activePage + 1;
    const endPage=Math.ceil(totalOfPosts / POSTS_PER_PAGE);
    if (nextPage <= endPage) {
      setActivePage(nextPage);
    }
    
  }
  function handlePrev() {
    const prevPage = activePage -1;
    if (prevPage >= 1) {
      setActivePage(prevPage);
    }
  }
  function handleFirst() {
    setActivePage(1);
  }
  function handleLast() {
    const endPage=Math.ceil(totalOfPosts / POSTS_PER_PAGE);
    setActivePage(endPage);
  }
 
 
  function updateCachePosts(pageNumbers:number[]){
    for(let page=pageNumbers[0]; page<=pageNumbers[pageNumbers.length-1]; page++){
      if(!cachePosts[page]){
        const promise = axios.get(NOTES_URL, {
          params: {
            _page: page,
            _per_page: POSTS_PER_PAGE
          }
        });
        promise.then(response => {
          setCachePosts((prevCachePosts) => {
            return {...prevCachePosts, [page]: response.data};
          })
          console.log("cache updated number: "+page+"");
        })
        .catch(err => {
          console.error(err);
        });
      }
    }
    //delete the cache of the pages that are not in the pageNumbers
    for(let page in cachePosts){
      if(!pageNumbers.includes(Number(page))){
        delete cachePosts[Number(page)];
        console.log("cache deleted number: "+page+"");
      }
    }
  }

  function createPageNumbers() {
    let pageNumbers = [];
    let totalPages= Math.ceil(totalOfPosts / POSTS_PER_PAGE);
    if (totalPages <6) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (activePage < 3) {
        pageNumbers = [1, 2, 3, 4, 5];
    } else if (activePage > totalPages - 2) {
        pageNumbers = [
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];

    } else {
        pageNumbers = [
          activePage - 2,
          activePage - 1,
          activePage,
          activePage + 1,
          activePage + 2,
        ];
    }
    updateCachePosts(pageNumbers);
    return pageNumbers;
  };
 
  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAddedContent(e.target.value);
  };

 
  const postsList = posts.map((post) => (
    <Note key={post.id} {...post} />
  ));
 
  function handleNew() {
    setIsAdding(true);
  }

  function handleSaveNewNote() {    
    try {      
      let idForNewNote=totalOfPosts + 1
      const newNote = { 
      id: idForNewNote,
      title:  idForNewNote,    
      author: {
      name:  user.name ,
      email: user.email ,},
      content: addedContent,
    };
    axios.post(NOTES_URL, newNote, { 'headers': {
      'Authorization': token
    }});
    setIsAdding(false);
    setAddedContent("");
    }
    catch (err) {
      console.error(err);
    }
  };
  
  function handleCancelNewNote(){
      setIsAdding(false);
      setAddedContent("");
  };

  function handleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }
 
  //
  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    const { create_user_form_name, create_user_form_email, create_user_form_username, create_user_form_password } = event.target as typeof event.target & {
      create_user_form_name: { value: string };
      create_user_form_email: { value: string };
      create_user_form_username: { value: string };
      create_user_form_password: { value: string };
    };
    await axios.post('http://localhost:3001/users', {
      name: create_user_form_name.value,
      email: create_user_form_email.value,
      username: create_user_form_username.value,
      password: create_user_form_password.value,
    });
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    const { login_form_username, login_form_password } = event.target as typeof event.target & {
      login_form_username: { value: string };
      login_form_password: { value: string };
    };
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username: login_form_username.value,
        password: login_form_password.value,
      });
      const token = response.data.token;
      setToken(`Bearer ${token}`);
      window.localStorage.setItem("loggedUser", JSON.stringify(response.data));
      setUser(response.data);
      setIsLoggedIn(true);
    }
    catch (err) {
      console.error("HandleLogIn function"+err);
    }
  }
  function handleLogOut(){
    setIsLoggedIn(false);
    setUser(null);
    setToken("");
    window.localStorage.removeItem("loggedUser");
  }
 
  function Note({ id, title, author, content }: noteType) {
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
   
    const handleDeleteClick = async () => {
      if (isLoggedIn && user.name === author.name){
        try{
          await axios.delete('http://localhost:3001/notes/'+id, { 'headers': {
            'Authorization': token
          }}
          );
            }
        catch (error) {
          console.error("Error deleting note:", error);
      }
    }
     
    };
    const handleEditClick = () => {
      if (isLoggedIn && user.name === author.name){
        setIsEditing(true);
      }};

    const handleSaveClick = async () => {
      if (isLoggedIn){
      setIsEditing(false);
      try{
        const updatedNote = {id, title, author, content: editedContent};
        const response = await axios.put('http://localhost:3001/notes/'+id, updatedNote, 
          { 'headers': {
            'Authorization': token
          }}
        );
      } catch (error) {
        console.error("Error updating note:", error);     
    }}} ;
  
    const handleCancelClick = () => {
      if (isLoggedIn){
        setEditedContent(content);
        setIsEditing(false);
      }
    };
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {setEditedContent(e.target.value);};
    
  return (
    <div className="note" id={id.toString()}>
      <h2>{title}</h2>
      <small>By {author.name} ({author.email})</small>
      <br />
      {isLoggedIn && isEditing ? (
        <div>
          <textarea
            name={`text_input-${id}`}
            value={editedContent}
            onChange={handleContentChange}
          />
          <button
            name={`text_input_save-${id}`}
            onClick={handleSaveClick}
          >Save</button>
          <button
            name={`text_input_cancel-${id}`}
            onClick={handleCancelClick}
          >Cancel</button>
        </div>
      ) : (
        <p>{editedContent}</p>
      )}
      {isLoggedIn && (
        <div className="button-row">
          <button
            name={`edit-${id}`}
            onClick={handleEditClick}
          >Edit</button>
          <button
            name={`delete-${id}`}
            onClick={handleDeleteClick}
          >Delete</button>
        </div>
      )}
    </div>
  );
};












  return (
    <div className={`app ${theme}`}>
      <h1>Welcome to the Notes App</h1>
      {!isLoggedIn ? (
        <>
          <form name="create_user_form" onSubmit={handleRegister}>
            <input name="create_user_form_name" placeholder="Name" />
            <input name="create_user_form_email" placeholder="Email" />
            <input name="create_user_form_username" placeholder="Username" />
            <input name="create_user_form_password" placeholder="Password" type="password" />
            <button name="create_user_form_create_user" type="submit">Create User</button>
          </form>
          <form name="login_form" onSubmit={handleLogin}>
            <input name="login_form_username" placeholder="Username" />
            <input name="login_form_password" placeholder="Password" type="password" />
            <button name= "login_form_login"type="submit">Login</button>
          </form>
        </>
      ) : (
        <>
          <p>Welcome, {user.name}!</p>
        </>
      )}
      <div className="notes">
        {postsList}
      </div>
      {isLoggedIn && (
        isAdding ? (
          <div>
            <textarea
              name={`text_input_new_note`}
              value={addedContent}
              onChange={handleContentChange} />
            <button name='text_input_cancel_new_note' onClick={handleCancelNewNote}>Cancel</button>
            <button name='text_input_save_new_note' onClick={handleSaveNewNote}>Save</button>
          </div>
        ) : (
          <button name='add_new_note' onClick={handleNew}>New</button>
        )
      )}
      <div className="pagination">
        {createPageNumbers().map((page) => (
          <button key={page} name={`page-${page}`} onClick={() => { setActivePage(page); }}
            style={{ fontWeight: activePage === page ? "bold" : "normal" }}>{page}
          </button>
        ))}
      </div>
      <div className="button-row">
        <button name="first" onClick={handleFirst}>First</button>
        <button name="previous" onClick={handlePrev}>Previous</button>
        <button name="next" onClick={handleNext}>Next</button>
        <button name="last" onClick={handleLast}>Last</button>
        <button name="change_theme" onClick={handleTheme}>Change Theme</button>
        {isLoggedIn && <button name="logout" onClick={handleLogOut}>Logout</button>}
      </div>
    </div>
  );
}
 