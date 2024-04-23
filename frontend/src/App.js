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
    const [stringArray, setStringArray] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [paragraphs, setParagraphs] = useState([]);


    const handleLeagueChange = (event) => {
        setselectedLeague(event.target.value);
    };
    
    // on click event for the generate commentary button
    const generate_commentary = async() => {

        const commentaryText = stringArray.join('\n');

        // Update the commentary <div> with the concatenated text
        document.querySelector(".text").style.display = "none";
        setParagraphs(String(summaries).split('\n\n'));

        // try {
        //     // Generate images for each text in stringArray
        //     const imageUrls = await Promise.all(stringArray.map(prompt => generateImages(prompt)));
            
        //     // Append the generated images to the image_list div
        //     const imageListDiv = document.querySelector(".image-list");
        //     imageUrls.forEach(imageUrl => {
        //         const img = document.createElement("img");
        //         img.src = imageUrl;
        //         img.alt = "Generated Image";
        //         img.className = "highlight";
        //         imageListDiv.appendChild(img);
        //     });
        // } catch (error) {
        //     console.error("Error generating commentary:", error);
        // }
    }

    // Function to handle games select dropdown change
    const handleGamesChange = (event) => {
        const selectedGameId = event.target.value;
 
        setSummaries(data[selectedGameId]);
    
        // Parse the filtered.csv file
        Papa.parse("filtered.csv", {
            download: true,
            header: true,
            complete: (result) => {
                // Filter rows based on matching id_odsp and text containing "goal"
                const matchingRows = result.data.filter(row => row.id_odsp === selectedGameId && row.text.toLowerCase().includes('goal'));
                const texts = matchingRows.map(row => row.text);
                setStringArray(texts);

            },
            error: (error) => {
                console.error("Error parsing filtered.csv:", error);
            }
        });

    };
    
    // Read and parse the CSV file
    useEffect(() => {
        Papa.parse("adjusted.csv", {
            download: true,
            header: true,
            complete: (result) => {
                const sortedGames = result.data.sort((a, b) => a.season.localeCompare(b.season));
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

    return (
        <div>
            <h1 className = "title" style={{ marginLeft: '5px' }}>Fine-Tuned Football Commentary Generator</h1>
            <div className="container">
                <div className="image-container">
                    <div className="image-list">
                        {/* <img src={myImage} alt="Commentary Visual" className="highlight" />
                        <img src={image1} alt="Commentary Visual" className="highlight" />
                        <img src={image2} alt="Commentary Visual" className="highlight" />
                        <img src={image3} alt="Commentary Visual" className="highlight" />
                        <img src={image4} alt="Commentary Visual" className="highlight" />
                        <img src={image5} alt="Commentary Visual" className="highlight" />
                        <img src={image6} alt="Commentary Visual" className="highlight" />
                        <img src={image7} alt="Commentary Visual" className="highlight" /> */}
                        {/* Add more images here */}
                    </div>
                </div>

                <div className="commentary">
                    <h3>Commentary</h3>
                    <p className="text" style={{ margin: '3px' }}>
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                    </p>
                    {paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}

                    <button className="play_audio">Play Audio</button>
                </div>

                <div className="options">

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
                        <div className="game_select">
                            <label htmlFor="games">Games:</label>
                            <select name="games" id="games" className="games" onChange={handleGamesChange}>
                                {games.map((game, index) => (
                                    <option key={index} value={game.id_odsp}>{game.ht} vs {game.at}</option>
                                ))}
                            </select> 
                        </div> 
                    </div>

                    <div className="option-group">
                        <label htmlFor="langs">Select Language:</label>
                        <select name="langs" id="langs" className="langs">
                            <option value="english">English</option>
                            <option value="french">French</option>
                        </select>
                    </div>

                    <div className="option-group">
                        <input type="submit" value="Generate Commentary" className="comment_gen" onClick={generate_commentary}/>
                    </div>
                    </div>

                <div className="upload">
                    <label htmlFor="upload" className="upload_label">Upload Your File:</label>
                    <br /><br />
                    <input type="submit" value="Upload File" className="upload_button" />
                </div>
            </div>
        </div>
    );
};

export default App;
