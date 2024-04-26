import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css'; 
import data from './generated_summaries.json';
import myImage from './images/_2b12a71e-43f5-45b3-bafe-cf1dca77ef70.jpg'
import image1 from './images/_4c3303d2-4e16-4254-82b7-387b756a0834.jpg';
import image2 from './images/_070f2f46-dd49-4fca-9e0e-4d418d0662db.jpg';
import image3 from './images/_97ae0f6e-6dee-4682-b08c-5ee731fe3092.jpg';
import image4 from './images/_7538ab4f-31b9-4a6b-9430-f18b05f5b5d2.jpg';
import image5 from './images/_c06113d9-90c9-41ce-83a1-ea689aef4c88.jpg';
import image6 from './images/_f6815fda-748d-4930-9fba-6418241b8417.jpg';
import image7 from './images/_fb64efe5-6225-45df-ab45-50076e1735c5.jpg';

const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: "", 
    dangerouslyAllowBrowser: true,
});

const App = () => {

    // State variables
    const [games, setGames] = useState([]);
    const [selectedLeague, setselectedLeague] = useState('england'); // Default year
    const [summaries, setSummaries] = useState([]);
    const [paragraphs, setParagraphs] = useState([]);
    const [events, setEvents] = useState([]);    
    const [elements, setElements] = useState(document.getElementsByTagName("p"));

    useEffect(() =>{
        setElements(document.getElementsByTagName("p"));
    },[elements]);

    const [gameID, setGameId] = useState('0');
    const [lang, setLang] = useState('en');
    const [voice, setVoice] = useState('peter');

    const audio = document.getElementById("audio");
    let audioIndex = 0;

    const handleEnded = () => {
        if (audioIndex < elements.length - 2) {
          elements[audioIndex + 1].style.color = "black";  
          audioIndex = audioIndex + 1;
        //   console.log(audioIndex);
          
          handlePlay();
        }
      };
    
    const handlePlay = () => {
        
        // console.log(elements[0]);
        audio.src = `./combined_audio/${gameID}/${voice}_${lang}_${audioIndex}_combined.wav`
        audio.play();
        elements[audioIndex + 1].style.color = "blue";
    };

    const handleLeagueChange = (event) => {
        setselectedLeague(event.target.value);
    };

    const handleLangChange = (event) => {
        if(event.target.value === 'english'){
            setLang('en');
        }else{
            setLang('fr');
        }
    }

    const handleVoiceChange = (event) => {
        if(event.target.value === 'vicki'){
            setVoice('vicki');
        }else{
            setVoice('peter');
        }
    }
    
    // on click event for the generate commentary button
    const generate_commentary = async() => {

        //const commentaryText = stringArray.join('\n');

        // Update the commentary <div> with the concatenated text
        document.querySelector(".text").style.display = "none";
        setParagraphs(String(summaries).split('\n\n'));


        //await textGen(String(summaries));

        // console.log(audioSrc);
        // if(gameID === '2J6xgTqs/' || gameID === 'G29Np7eA/' || gameID === "StRC9O3T/"){
        //     console.log(lang);
        //     console.log(voice);
        // }

    }

    // Function to handle games select dropdown change
    const handleGamesChange = (event) => {
        const selectedGameId = event.target.value;
 
        setSummaries(data[selectedGameId]);
        setGameId(selectedGameId);

    };
    
    // Read and parse the CSV file
    useEffect(() => {
        Papa.parse("adjusted.csv", {
            download: true,
            header: true,
            complete: (result) => {
                const sortedGames = result.data.sort((a, b) => a.season);
                // TODO:
                // const sortedGames = result.data.sort((a, b) => a.season.localeCompare(b.season));
                const filteredGames = sortedGames.filter(game => game.country === selectedLeague);
                setGames(filteredGames);
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
            }
        });
    }, [selectedLeague]);

    // Generates the images based on given prompt
    const generateImages = async (prompt) => {
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });
            const imageUrl = response.data[0].url;
            console.log(imageUrl);
            return imageUrl; 
        } catch (error) {
            console.error("Error generating image:", error);
            return null; 
        }
    };

    async function textGen(prompt) {
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant designed to output JSON in the format: { key_events: [ {description: }, {description: }, {description: }, {description: }, {description: }]}.",
            },
            { role: "user", content: "Identify 5 key events from the following game summary:  " + prompt },
          ],
          model: "gpt-3.5-turbo-0125",
          response_format: { type: "json_object" },
        });
        console.log(completion.choices[0].message.content);
        const result = JSON.parse(completion.choices[0].message.content);
        setEvents(result.key_events.map(moment => moment.description)); 
    };

    async function promptgen(prompt) {
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Rewrite the given prompt with details such as team name, jersey colors, where the play takes place, player numbers, and crowd emotions so that the prompt can be directly passed into DALL-E3 to generate an image. And make sure to specify that the image be created in a impressionist painting style",
                    },
                    { role: "user", content: "The user prompt: " + prompt },
                ],
                model: "gpt-3.5-turbo-0125",
            });
            //console.log(completion.choices[0].message.content);
            return completion.choices[0].message.content;
        } catch (error) {
            console.error("Error generating prompt:", error);
            return null;
        }
    }

    // useEffect(() => {
    //     const generateAndAppendImages = async () => {
    //         const imageListDiv = document.querySelector(".image-list");
    //         imageListDiv.innerHTML = "";
            
    //         if (events.length > 0) {
    //             for (let i = 0; i < events.length; i++) {
    //                 let imgPrompt = await promptgen(events[i]);
    //                 console.log(imgPrompt);
    //                 let imageUrl = await generateImages(imgPrompt);
    //                 const imageListDiv = document.querySelector(".image-list");
    //                 const img = document.createElement("img");
    //                 img.src = imageUrl;
    //                 img.alt = "Generated Image";
    //                 img.className = "highlight";
    //                 img.style.height = "768px";
    //                 imageListDiv.appendChild(img);
    //             }
    //         }
    //     };
    
    //     generateAndAppendImages();
    // }, [events]);



    return (
        <div>
            <h1 className = "title">Football Commentary Generator</h1>
            <div className="container">
                <div className="options-commentary-container">
                    
                    <div className="options">
                        <div className="options-1">
                            <div className="option-group">
                                <label htmlFor="leagues">League:</label>
                                <select name="leagues" id="leagues" className="leagues" onChange={handleLeagueChange}>
                                <option value="england">England</option>
                                <option value="spain">Spain</option>
                                <option value="italy">Italy</option>
                                <option value="germany">Germany</option>
                                <option value="france">France</option>
                                </select>
                            </div>

                            <div className="option-group">
                                <label htmlFor="langs">Select Language:</label>
                                <select name="langs" id="langs" className="langs" onChange={handleLangChange}>
                                    <option value="english">English</option>
                                    <option value="french">French</option>
                                </select>
                            </div>
     
                        </div>

                        <div className="options-1">
                            <div className="option-group">
                                <label htmlFor="voices">Select Commentator:</label>
                                <select name="voices" id="voices" className="voices" onChange={handleVoiceChange}>
                                    <option value="peter">Peter</option>
                                    <option value="vicki">Vicki</option>
                                </select>
                            </div>

                            <div className="option-group">
                                <div className="game_select">
                                    <label htmlFor="games">Games:</label>
                                    <select name="games" id="games" className="games" onChange={handleGamesChange}>
                                        {games.map((game, index) => (
                                            <option key={index} value={game.id_odsp}>{game.ht} vs {game.at}</option>
                                        ))}
                                    </select> 
                                </div> 
                            </div>  
                        </div>

                        <div className="option-group generate-button">
                            <input type="submit" value="Generate Commentary" className="comment_gen" onClick={generate_commentary}/>
                        </div>
                    </div>

                    <div className="commentary">
                        <div className="commentary-header">
                            <h3>Commentary</h3>
                            <button className="play_audio" onClick={handlePlay} autoPlay>Play Audio</button>
                            <audio id="audio" onEnded={handleEnded}>
                            </audio>
                        </div>
                        
                        <p className="text" style={{ margin: '3px' }}>
                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        </p>
                        {paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}

                        
                    </div>

                </div>
                <div className="image-container">
                    <div className="image-list">
                    <img src = 'https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg' alt = 'placeholder'></img>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
