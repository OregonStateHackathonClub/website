import React from 'react';

function Registration({ currentHackathon }) {
    return (
        <div class="infobody">
            <h1>How to Register:</h1>
            <p>To join the next hackathon, sign up for Beaverhacks on <button class="joinclubbuttons"><a href={currentHackathon.linkToDevPost} target="_blank" rel="noreferrer noopener">DevPost</a></button> and join the club via <button class="joinclubbuttons"><a href="https://apps.ideal-logic.com/osusli" target="_blank" rel="noreferrer noopener">IdealLogic</a></button></p>

            <h1>Find your Team: </h1>
            <p>Use <button class="joinclubbuttons"><a href={currentHackathon.linkToDevPost} target="_blank" rel="noreferrer noopener">DevPost</a></button>, <button class="joinclubbuttons"><a href="https://discord.gg/pCesGNGjPc" target="_blank" rel="noreferrer noopener">Discord</a></button>, or <button class="joinclubbuttons"><a href="https://osu-hackathon.slack.com/" target="_blank">Slack</a></button> to find teammates.</p>
        </div>
    );
}


export default Registration