import { fetch_Request } from "../api";
import { ENDPOINT ,getItemFromLocalStorage,LOADED_TRACKS,logout_profile, setItemInLocalStorage } from "../common";
import {SECTIONTYPE }from "../common";

//we will create audio link in js and will link that visual audio controller with this link
const audio = new Audio();
let displayName;

const onProfileClick = (event) => {

    event.stopPropagation();

    const profileMenu = document.querySelector("#profile-menu");
    profileMenu.classList.toggle("hidden");
    if(!profileMenu.classList.contains("hidden")){
        profileMenu.querySelector("li#logout").addEventListener("click",logout_profile);
        
    }
}

const load_userProfile = () => {
    return new Promise(async (resolve , reject)=>{

        const default_image = document.querySelector("#default-image");
        const profile_button = document.querySelector("#profile_btn_of_user");
        const displayNameElement = document.querySelector("#display_name");
        const {display_name: displayName , images } = await fetch_Request(ENDPOINT.userinfo)
        
        if(images?.length){
            default_image.classList.add("hidden");
        }else{
            default_image.classList.remove("hidden");   
        }
        profile_button.addEventListener("click", onProfileClick)
        displayNameElement.textContent = displayName;
        resolve({displayName , images});
    })


} 

//after creating a section we want to handle playlist item click =ed 
const onPlaylistItemClicked = (event , id)=>{
console.log(event.target);
const section = {type:SECTIONTYPE.PLAYLIST , playlist:id};
history.pushState(section,"",`playlist/${id}`);
load_Section(section);
}

// create templates for page of featured playlist dynamiccaly

const load_Playlist = async(endpoint , elementId)=>{
    const {playlists : {items}} = await fetch_Request(endpoint);
    //get that featured entyr point from dahboarad.html
    const playlist_itemsection = document.querySelector(`#${elementId}`);
    // console.log(items);
    for (let {name , description , images , id} of items )
    {
        const createplaylistItem = document.createElement("section");
        createplaylistItem.className = "bg-black-secondary  rounded p-4  hover:cursor-pointer hover:bg-light-black";
        createplaylistItem.id = id;
        createplaylistItem.setAttribute("data-type" , "playlist");
        createplaylistItem.addEventListener("click" ,(event)=> onPlaylistItemClicked(event , id) )
        
        const [{url : imageURL}] = images;
        createplaylistItem.innerHTML = 
                `  <img src="${imageURL}" alt="${name}" class="rounded mb-2 object-contain shadow" />
                    <h2 class="text-base font-semibold mb-4 truncate ">${name}</h2>
                    <h3 class="text-sm  text-secondary line-clamp-2">${description}</h3>`;//for line clamp we have installed npm install @tailwindcss/line-clamp from tailwind then added plufin into config file of tailwind

                    playlist_itemsection.appendChild(createplaylistItem);
                    
    }
    // now after generating this section append it to its inner html
   
    
}

const loadPlaylists = ()=>{
   
    load_Playlist(ENDPOINT.featured_playlist , "featured_playlistzItem" );
    load_Playlist(ENDPOINT.toplists , "topPlay_List_Items" );
   
    
    
}

//create a function that will add song item in article 
const fill_DashboardContent = ()=>{
   const coverConText = document.querySelector("#cover_content");
   coverConText.innerHTML = `<h1 class="text-6xl">Hello , ${displayName}</h1> `
 const pageContent = document.querySelector("#page_Content");
const playListMap = new Map([["featured","featured_playlistzItem"],["top Playlist","topPlay_List_Items"]])
    let innerHTML = "";
    for(let [type , id] of playListMap){
        innerHTML +=`<article class="p-5">
            <h1 class="text-2xl mb-4 font-bold capitalize">${type}</h1>
            <section id="${id}" class="featured-songs grid  grid-cols-autoFillCard gap-4 m-4 " >
            </section>
            </article>`
    }
    pageContent.innerHTML = innerHTML;

}

const format_time = (duration)=>
{
    const minute = Math.floor(duration/60_000);
    const second = ((duration%6_000)/1000).toFixed(0);
    const formattedTime = second == 60?
    minute +1 +":00":minute + ":" + (second<10?"0":"")+second;
    return formattedTime ;
}

const ontrack_selection = (id , event ) =>
{
  document.querySelectorAll("#tracks.track").forEach(trackitem => {
    if(trackitem.id === id)
    {
        trackitem.classList.add("bg-gray" , "selected")
    }
    else{
        trackitem.classList.remove("bg-gray" , "selected")
    }
  })
}

const updateIconforPlayMode = (id) =>
{
    const play_Button = document.querySelector("#play");
    play_Button.querySelector("span").textContent = "pause_circle";
    const playbuttonFromtrack = document.querySelector(`#play-track-${id}`) ;
    // console.log(playbuttonFromtrack);
    if(playbuttonFromtrack){
        playbuttonFromtrack.textContent = "pause";

    }
}

const updateIconforPauseMode =(id)=>{
    const play_Button = document.querySelector("#play");
    play_Button.querySelector("span").textContent = "play_circle";
    const playbuttonFromtrack = document.querySelector(`#play-track-${id}`) ; 
         if(playbuttonFromtrack){
            playbuttonFromtrack.textContent = "play_arrow";
           }
        // playbuttonFromtrack.removeAttribute("data-play");  
}

// const time_line = document.querySelector("#")
const onAudioMeatDataLoaded = (id)=>{
    const totalSong_duration = document.querySelector("#total_song_duration");

    totalSong_duration.textContent =` 0:${audio.duration.toFixed(0)}`;
    // updateIconforPlayMode(id);


}



const toggelPlay = ()=>{
    if(audio.src)
    {
        if(audio.paused)
       {
            audio.play();
           
            
       } 
       else{
        audio.pause();
        
       }
    }
}

const findCurrentTrack = ()=>{
    const audioControll = document.querySelector("#audio-controller");
    const trackId = audioControll.getAttribute("data-track-id");
    if(trackId){
        const loadedTracks = getItemFromLocalStorage(LOADED_TRACKS);
        const currentTrackIndex = loadedTracks?.findIndex(trk=> trk.id === trackId);
        return {currentTrackIndex , tracks:loadedTracks} ;
    }
    return null;
}

const playNextTrack = ()=>{
    const {currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
    if(currentTrackIndex > -1 && currentTrackIndex <tracks?.length -1){
        onplayTrack(null , tracks[currentTrackIndex +1 ]);    //``````
    }  
}
const playPrevTrack = ()=>{
    const {currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
    if(currentTrackIndex > 0){
        onplayTrack(null , tracks[currentTrackIndex - 1 ]);    //``````
    }    
}

const onplayTrack = (event , {image , artistName , name ,previewURL , duration , id}) =>{
//    const btnWithDataPlay = document.querySelector(`[data-play = "true"]`);
if(event?.stopPropagation) {
    event.stopPropagation();
}
if(audio.src === previewURL)
    {
        toggelPlay();
    }
    else{
        // document.querySelectorAll("[data-play]").forEach(btn => btn.setAttribute("data-play" , "false"));
        // btnWithDataPlay?.setAttribute("data-play" , "false");
    console.log(image , artistName , name ,previewURL , duration , id);

    const nowplayingSong_image = document.querySelector("#now_playing_image");
    const artist = document.querySelector("#nowPlaying_artist");
    const songTitle = document.querySelector("#nowPlaying_song");
    const audioControll = document.querySelector("#audio-controller");
    const songInfo = document.querySelector("#song-info");

    audioControll.setAttribute("data-track-id" , id);
    nowplayingSong_image.src  = image.url;
    songTitle.textContent = name;
    artist.textContent = artistName;

    audio.src = previewURL; 
    audio.play();
    songInfo.classList.remove("invisible");

    }
    

}

const loadplaylistTrack = ({tracks})=> //create indivisual track 
{
 const track_section = document.querySelector("#track");
  //     <section class="track grid grid-cols-[50px_2fr_1fr_50px] gap-4 items-center justify-items-start rounded-md hover:bg-light-black text-secondary">
        //     <p class="justify-self-center">1</p>
        //     <section class="grid grid-cols-2 gap-2 ">
        //         <img class="h-8 w-8 " src="" alt="">
        //         <article class="flex flex-col gap-1">
        //             <h2 class="text-primary text-xl">song</h2>
        //             <p class="text-sm">artist</p>
        //         </article>
        //     </section>
        //     <p>Album</p>
        //     <p>1:36</p>
        // </section>
 let track_no = 1;
 const loadedTrcaks  = [];

 for(let trackitem of tracks.items.filter(item => item.track.preview_url))
 {
    let {id , artists , name , album , duration_ms : duration , preview_url : previewURL  } = trackitem.track;
    let track = document.createElement("section");
    track.id = id;
    track.className = "track p-1 grid grid-cols-[50px_1fr_1fr_50px] gap-4 items-center justify-items-start rounded-md hover:bg-light-black text-secondary";
    let image = album.images.find(img=>img.height === 64);
    let artistName = Array.from(artists , artist=> artist.name).join(", ");
    track.innerHTML = `
    <p class="relative w-full flex items-center justify-center justify-self-center"><span class="track_no">${track_no++}</span></p>
        <section class="grid grid-cols-[auto_1fr] place-items-center gap-2 ">
            <img class="h-12 w-12 " src="${image.url}" alt="${name}">
            <article class="flex flex-col gap-2 justify-center">
                <h2 class="song-title text-primary text-base line-clamp-1">${name}</h2>
                <p class="text-xs line-clamp-1">${artistName}</p>
            </article>
        </section>
        <p class="text-sm">${album.name}</p>
        <p class="text-sm">${format_time( duration)}</p>`;

        track.addEventListener("click" , (event) => ontrack_selection(id , event ))
        const play_button = document.createElement("button");
        play_button.id = `play-track-${id}`;
        play_button.className = `play w-full absolute left-0 , text-lg , invisible material-symbol-outlined `;
        play_button.textContent = "▶"; //"play_arrow";
        play_button.addEventListener("click" , (event) => onplayTrack(event , {image , artistName , name ,previewURL , duration , id }))
        // play_button.textContent = "👊🏽";
        track.querySelector("p").appendChild(play_button);
        track_section.appendChild(track);
        loadedTrcaks.push({id, artistName , name , album , duration , image , previewURL});
    }

    setItemInLocalStorage(LOADED_TRACKS , loadedTrcaks);
}

//content for playlist according to their id
const fillContentInPlaylist = async(playlistId)=>{
    const playlist = await fetch_Request(`${ENDPOINT.playlist}/${playlistId}`) //get all track inside playlist and there is a endpoint associated with each playlist dahsboard of developer spotify>>console>>playlsit>>get playlist
//    console.log(playlist);


    const {name , description , images , tracks}= playlist;
    const cover_element = document.querySelector("#cover_content");
    cover_element.innerHTML = `
    <img src="${images[0].url}" alt="" class="object-contain h-48 w-48">
    <section>
    <h2 id="playlist-Name" class="text-4xl" >${name}</h2>
    <p id="playlist-Details">${tracks.items.length} songs</p>
    </section>`;

    const pageContent = document.querySelector("#page_Content");
    pageContent.innerHTML = `<header id="playlist_header" class="mx-8 border-secondary border-b-[0.5px] z-10">
            <nav class="py-2">
            <ul class="grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary ">
                <li class="justify-self-center">#</li>
                <li>Title</li>
                <li>Album</li>
                <li>🕛</li>
            </ul>
            </nav>
            </header>
            <section id="track" class="px-8 mt-4 text-secondary"> 
            </section>`;
    loadplaylistTrack(playlist);
    console.log(playlist); //there is track inside track there is item which also have track and preview link
//we will use preview url to play song associated with taht id as we are using free version we can only play for 30 sec
}

const onContent_Scroll = (event) =>
{
    const {scrollTop } = event.target;// this will give us how much we have scroll from top
    const header = document.querySelector(".header-element");
    const cover_element = document.querySelector("#cover_content") ;
    const totalHeight = cover_element.offsetHeight;
    const coverOpacity = 100 -  (scrollTop >= totalHeight? 100 : ((scrollTop/totalHeight)*100));
    const headerOpacity = scrollTop >= header.offsetHeight? 100: ((scrollTop/header.offsetHeight)*100);
    cover_element.style.opacity = `${coverOpacity}`;
    header.style.background = `rgba(0 0 0 /${headerOpacity}%)`;

    // if(scrollTop>= header.offsetHeight)
    // {
    //     header.classList.add("sticky" ,"top-0", "bg-black");
    //     header.classList.remove("bg-transparent")
    // }
    // else
    // {
    //     header.classList.remove("sticky" ,"top-0", "bg-black");
    //     header.classList.add("bg-transparentn")   
    // }
    if(history.state.type === SECTIONTYPE.PLAYLIST)
    {
        
        const playlistHeader = document.querySelector("#playlist_header");
         if(coverOpacity <= 35)
         {
            playlistHeader.classList.add("sticky" ,"bg-black-secondary", "px-8"); 
            playlistHeader.classList.remove("mx-8");
            playlistHeader.style.top =`${header.offsetHeight}px`;
         }
         else{
            playlistHeader.classList.remove("sticky" ,"bg-black-secondary", "px-8"); 
            playlistHeader.classList.add("mx-8");
            playlistHeader.style.top =`revert`;  
         }
    }
}

// will change the content dynamically based on where we add the contenet because on clicking image template only contenet is changing and all header remains constant 
const load_Section = (section)=>{
    if(section.type === SECTIONTYPE.DASHBOARD)
    {
        fill_DashboardContent();
        loadPlaylists();
    }
    else if(section.type === SECTIONTYPE.PLAYLIST){
        //load the element for playlist
        // const pageContent = document.querySelector("#page_Content");
        // pageContent.innerHTML = "playlist to be loaded here ";
        fillContentInPlaylist(section.playlist);
    }

    document.querySelector(".content").removeEventListener("scroll" , onContent_Scroll);
    document.querySelector(".content").addEventListener("scroll" , onContent_Scroll);
}

const onUserPlaylistClicked = (id) =>{
    const section = {type:SECTIONTYPE.PLAYLIST , playlist:id};
    history.pushState(section , "" , `/dashboard/playlist/${id}`);
    load_Section(section);
}

const loadUserPlaylist = async()=>{
    const playlists = await fetch_Request(ENDPOINT.userPlaylist);
    console.log((playlists));
    const userPlaylistSection = document.querySelector("#user-playlist >ul");
    userPlaylistSection.innerHTML = "";
    for(let {name , id } of playlists.items){
        const li = document.createElement("li");
        li.textContent = name;
        li.className = "cursor-pointer hover:text-primary";
        li.addEventListener("click" , () => onUserPlaylistClicked(id))
        userPlaylistSection.appendChild(li);
    } 
}

document.addEventListener("DOMContentLoaded",async()=>{
    const volume = document.querySelector("#volume");
const play_Button = document.querySelector("#play");
const songDuration_completed = document.querySelector("#songDurationCompleted");
const song_progress = document.querySelector("#progress");
const time_line = document.querySelector("#timeLine");
const audio_controll = document.querySelector("#audio-controller");
const next = document.querySelector("#next");
const prev = document.querySelector("#prev");
let progress_interval ;

    ({displayName} = await load_userProfile());
    loadUserPlaylist()
    const section = {type:SECTIONTYPE.DASHBOARD };
    // playlist / playlist/37i9dQZF1DXdSavJjIP6Fb
    // const section = {type:SECTIONTYPE.PLAYLIST , playlist:"playlist/37i9dQZF1DXdSavJjIP6Fb"}
    // history.pushState(section , "" ,` /dashboard/playlist/${section.playlist}`);//we are pushing state associated with URL .first time dashboard will be loaded  data associated with initial state is dashboard
    history.pushState(section , "" , "");
    load_Section(section);
    // fill_DashboardContent();
    // loadPlaylists();
    
    document.addEventListener("click" , ()=>{
        const profileMenu = document.querySelector("#profile-menu");
        if(!profileMenu.classList.contains("hidden"))
        {
            profileMenu.classList.add("hidden")
        } 
    })

    audio.addEventListener("play" , ()=>{
       
    const selectedtrackid = audio_controll.getAttribute("data-track-id");
    const tracks = document.querySelector("#tracks");
    const playingTracks = tracks?.querySelector("section.playing");
    const selectedTrack = tracks?.querySelector(`[id="${selectedtrackid}"]`);
    if(playingTracks?.id !== selectedTrack.id){
        playingTracks?.classList.remove("playing");
    }
    selectedTrack?.classList.add("playing");
    progress_interval =  setInterval(()=>{
        if(audio.paused)
        {
            return 
        }
        songDuration_completed.textContent = `${audio.currentTime.toFixed(0) <10 ? "0:0" + audio.currentTime.toFixed(0) : "0"+audio.currentTime.toFixed(0)}`;
        song_progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        } , 100);
        updateIconforPlayMode(selectedtrackid);

    });
    audio.addEventListener("pause" , ()=>{
        if(progress_interval)
        {
            clearInterval(progress_interval);
        }
        const selectedtrackid = audio_controll.getAttribute("data-track-id");
        updateIconforPauseMode(selectedtrackid);
    })

    audio.addEventListener("loadedmetadata" , onAudioMeatDataLoaded);
    play_Button.addEventListener("click" ,toggelPlay );

    volume.addEventListener("change" , ()=>{
        audio.volume = volume.value / 100;
    })
    
    time_line.addEventListener("click" , (e)=>{
        const timeLineWidth = window.getComputedStyle(time_line).width;
        const timeToSeek = (e.offsetX / parseInt(timeLineWidth))*audio.duration;
        audio.currentTime = timeToSeek;
        song_progress.style.width =`${(audio.currentTime / audio.duration)*100 }%`
    } , false);

    next.addEventListener("click" , playNextTrack)
    prev.addEventListener("click" , playPrevTrack)

    window.addEventListener("popstate" , (event)=>{
        // console.log(event);
        load_Section(event.state);//now we want to get state(we are pushing in history) from that event once we get that sate we want to load that particular section associated with that state 
    })//whenever we click back button a popstate event i called 

})