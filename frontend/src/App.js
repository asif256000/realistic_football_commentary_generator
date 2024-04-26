import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css'; 
import data from './generated_summaries.json';

// import myImage1 from './images/intergoal.jpg'
// import myImage2 from './images/intergoal2.jpg'
// import myImage3 from './images/intergoal3.jpg'
// import myImage4 from './images/milangoal.jpg'
// import myImage5 from './images/milangoal2.jpg'

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
          elements[audioIndex].style.color = "black";  
          audioIndex = audioIndex + 1;
        //   console.log(audioIndex);
          
          handlePlay();
        }
      };
    
    const handlePlay = () => {
        
        // console.log(elements[0]);
        audio.src = `./combined_audio/${gameID}/${voice}_${lang}_${audioIndex}_combined.wav`
        audio.play();
        elements[audioIndex].style.color = "blue";
    };

    const stopAudio = () => {
        audio.pause();
        elements[audioIndex].style.color = "black"; 
    }

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

        // document.querySelector(".placeholder").style.display = "none";


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

                        <div className="generate-button">
                            <input type="submit" value="Generate Commentary" className="commentary-button" onClick={generate_commentary}/>
                        </div>
                    </div>

                    <div className="commentary">
                        <div className="commentary-header">
                            <h3>Commentary</h3>
                            <button className="stop_audio" onClick={stopAudio}>Stop Audio</button>
                            <button className="play_audio" onClick={handlePlay} autoPlay>Play Audio</button>
                            <audio id="audio" onEnded={handleEnded}>
                            </audio>
                            
                        </div>
                        
                        <div className="text" style={{ margin: '3px' }}>
                            How to use:
                            <br></br><br></br>
                            <strong>Select Your League: </strong>
                            Begin by choosing your preferred football league from the “League” dropdown menu. Choose from the English, Spain, Italian, German, and French leagues.
                            <br></br><br></br>
                            <strong>Choose Your Language: </strong>
                            Next, click on the “Select Language” dropdown. Pick the language in which you want to receive the audio commentary. The options are limited to English and French right now
                            <br></br><br></br>
                            <strong>Pick a Commentator: </strong>
                            Now, explore the “Select Commentator” dropdown. You’ll find two commentators Peter for the male voice, and Vicki for the female voice.
                            <br></br><br></br>
                            <strong>Select a Game: </strong>
                            Finally, use the dropdown to select a specific football match or game from the league you have selected. 
                            <br></br><br></br>
                            <strong>Generate Commentary: </strong>
                            Once you’ve made all your selections, click on the “Generate Commentary” button to receive personalized football commentary based on your chosen attributes.
                            <br></br><br></br>
                            Enjoy scrolling through the generated highlight images, and click "Play Audio" to hear the summary of the game.
                        </div>




                        {paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}

                        
                    </div>

                </div>
                <div className="image-container">
                    <div className="image-list">
                        <img src = 'https://images.saatchiart.com/saatchi/855782/art/4051777/3121630-HSC00001-7.jpg' alt = 'placeholder' className='placeholder' style= {{height: "800px"}}></img>
                        {/* <img src={myImage3} alt="Commentary Visual" className="highlight" />
                        <img src={myImage5} alt="Commentary Visual" className="highlight" />
                        <img src={myImage4} alt="Commentary Visual" className="highlight" />                        
                        <img src={myImage2} alt="Commentary Visual" className="highlight" />
                        <img src={myImage1} alt="Commentary Visual" className="highlight" />                         */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
