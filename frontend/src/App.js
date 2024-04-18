//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
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css'; 
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
    apiKey: "api-key", 
    dangerouslyAllowBrowser: true,
});

const App = () => {

    // State variables
    const [games, setGames] = useState([]);
    const [selectedYear, setSelectedYear] = useState('2012'); 
    const [stringArray, setStringArray] = useState([]);

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };
    
    const generate_commentary = async() => {
        console.log(stringArray); // Trigger click event on the gen_commentary button
        try {
            // Generate images for each text in stringArray
            const imageUrls = await Promise.all(stringArray.map(prompt => generateImages(prompt)));
            
            // Append the generated images to the image_list div
            const imageListDiv = document.querySelector(".image-list");
            imageUrls.forEach(imageUrl => {
                const img = document.createElement("img");
                img.src = imageUrl;
                img.alt = "Generated Image";
                img.className = "highlight";
                imageListDiv.appendChild(img);
            });
        } catch (error) {
            console.error("Error generating commentary:", error);
        }
    }

    // New function to handle games select dropdown change
    const handleGamesChange = (event) => {
        const selectedGameId = event.target.value;
        //console.log("Selected Game ID:", selectedGameId);
    
        // Parse the filtered.csv file
        Papa.parse("filtered.csv", {
            download: true,
            header: true,
            complete: (result) => {
                // Filter rows based on matching id_odsp and text containing "goal"
                const matchingRows = result.data.filter(row => row.id_odsp === selectedGameId && row.text.toLowerCase().includes('goal'));
                // Log the matching rows
                const texts = matchingRows.map(row => row.text);
                console.log("Matching Rows:", matchingRows);
                //console.log("Texts:", texts);
                // Update the state with the array of texts
                setStringArray(texts);
                //console.log(stringArray);
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
                const filteredGames = sortedGames.filter(game => game.season === selectedYear);
                setGames(filteredGames);
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
            }
        });
    }, [selectedYear]);

    const generateImages = async (prompt) => {
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt, // Use the prompt parameter here
                n: 1,
                size: "1024x1024",
            });
            const imageUrl = response.data[0].url;
            console.log(imageUrl);
            return imageUrl; // Return the imageUrl
        } catch (error) {
            console.error("Error generating image:", error);
            return null; // Return null in case of error
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
                    <p style={{ margin: '3px' }}>
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                    </p>
                    <button className="play_audio">Play Audio</button>
                </div>

                <div className="options">
                    <div className="find_games">
                        <div className="year_select">
                            <label htmlFor="years">Year:</label><br />
                            <select name="years" id="years" className="years" onChange={handleYearChange}>
                                <option value="2012">2012</option>
                                <option value="2013">2013</option>
                                <option value="2014">2014</option>
                                <option value="2015">2015</option>
                                <option value="2016">2016</option>
                                <option value="2017">2017</option>
                            </select>
                        </div>

                        <div className="league_select">
                            <label htmlFor="leagues">League:</label><br />
                            <select name="leagues" id="leagues" className="leagues">
                                <option value="England">England</option>
                                <option value="Spain">Spain</option>
                                <option value="Italy">Italy</option>
                                <option value="Germany">Germany</option>
                                <option value="France">France</option>
                            </select>
                        </div>

                        {/* <div className="gen_games">
                            <input type="submit" value="Generate Games" className="game_gen" />
                        </div> */}
                    </div>

                    <div className="games_list">
                        <div className="game_select">
                            <label htmlFor="games">Games:</label><br />
                            {/* <select name="games" id="games" multiple className="games" onChange={handleYearChange}>
                            {games.map((game, index) => (
                                <option key={index} value={game}>{game}</option>
                                ))}
                            </select>  */}
                            <select name="games" id="games" multiple className="games" onChange={handleGamesChange}>
                                {games.map((game, index) => (
                                    <option key={index} value={game.id_odsp}>{game.ht} vs {game.at}</option>
                                ))}
                            </select> 
                        </div> 
                    </div>

                    <div className="choose_lang">
                        <div className="language_select">
                            <label htmlFor="langs">Select Language:</label><br />
                            <select name="langs" id="langs" className="langs">
                                <option value="english">English</option>
                                <option value="spanish">Spanish</option>
                                <option value="french">French</option>
                                <option value="italian">Italian</option>
                                <option value="german">German</option>
                            </select>
                        </div>

                        <div className="gen_commentary">
                            <input type="submit" value="Generate Commentary" className="comment_gen" onClick={generate_commentary}/>
                        </div>
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
