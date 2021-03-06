import React, { Component } from 'react';
import Card from './Card.js';
import sounds from './sounds.js';
import { randomNumber, select_sound, KEYBOARD, KEYS_TO_START, NUMPAD} from './helpers.js';
import Sound from 'react-sound';

import './Game.css';
import './helpers.css';
import chip from './img/red-chip.png';

var FontAwesome = require('react-fontawesome');

const cardStack = ['Ace','2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

class Game extends Component {
    constructor(props){
        super(props);

        this.state = {
            // is game on?
            playing: false,

            //packages card
            selectedPackages: 2,
            packagesForDealer: 2,

            // card value
            cards: '',
            cardsDealer: '',

            // game score
            score: 0,

            // voices
            voices: true,

            // sounds
            sounds: true,
            soundStatus: 'stop',
            soundName: 'failure',

            // display cards
            display: true,
            showDeal: true,

            // sums
            sumsDealer: '',
            mySums: '',

            // info box displaying
            infoBox: true,

            // bets
            numberBet: '',
            yourBet: ''
        };

        this.turnVoices = this.turnVoices.bind(this);
        this.turnSound = this.turnSound.bind(this);
        this.controlDisplay = this.controlDisplay.bind(this);

        // handle keys
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        this.newGame = this.newGame.bind(this);
        this.numberPackages = this.numberPackages.bind(this);
        this.numberPackagesDeal = this.numberPackagesDeal.bind(this);


        this.handleFinishedPlaying = this.handleFinishedPlaying.bind(this);
        this.removeEventListeners = this.removeEventListeners.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);
        this.onEnd = this.onEnd.bind(this);
    }

    componentDidMount() {
        window.responsiveVoice.speak("Zvol si výši svých sázek pomocí číselných kláves 1 až 3", "Czech Female");
        document.addEventListener('keyup', (e) => {
            if (e.keyCode === 18) {
                e.preventDefault();
                this.app.focus();
            }
        });
        this.addEventListeners();
        /*this.newGame();*/
    }

    componentWillUnmount() {
        // remove key listener
        this.removeEventListeners();
        document.removeEventListener('keyup');
    }

    addEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    generateNewCardV2(card, chance = false) { // card = { cardValue: 'KING', color: 0/1 }
        const randomColor = randomNumber(0, 4);
        const randomValue = randomNumber(0, 13);

        // 1. if card var is not defined =>
        // => card will be generated randomly
        const newCard = {
            cardValue: cardStack[randomValue],
            color: randomColor
        };

        // 2. Card is object
        if (typeof card === 'object') {
            // if chance is true =>
            // return next suitable card
            if (chance) {
                const currentCardIndex = this.getCardIndex(card.cardValue);
                // color of new card (flip colors)

                // card index of current card
                newCard.cardValue = cardStack[currentCardIndex - 1];
                newCard.color = card.color;
            }

            // if new card is same like the old one, call this fn again
            if ((card.color === newCard.color) && (card.cardValue === newCard.cardValue)) {
                return this.generateNewCardV2(newCard);
            }
        }

        // 3. return new card
        return newCard;
    }

    // turn voices off/on
    turnVoices() {
        this.setState({
            voices: !this.state.voices
        }, () => {
            if(this.state.seconds > 0) {
                document.addEventListener('keydown', this.handleKeyDown);
                document.addEventListener('keyup', this.handleKeyUp);
            }
            if(!this.state.voices) {
                window.responsiveVoice.speak(" ", "Czech Female");
            }
        });

        this.buttonVoices.blur();
    }

    // turn sounds off/on
    turnSound() {
        this.setState({
            sounds: !this.state.sounds
        });

        this.buttonSounds.blur();
    }

    // display controls - blind mode
    controlDisplay() {
        this.setState({
            display: !this.state.display
        });

        this.buttonDisplay.blur();
    }

    // handle keyDown - press 'number 1, 2 or 3' to locate the card, 'Ctrl' to card discard and 'Alt' to read cards again
    handleKeyDown(e) {
        if (KEYS_TO_START.indexOf(e.keyCode) !== -1) {
            if (e.keyCode === NUMPAD.KEY_ONE || e.keyCode === KEYBOARD.KEY_ONE) {
                this.setState({
                    numberBet: 1,
                });
            }
            if (e.keyCode === NUMPAD.KEY_TWO || e.keyCode === KEYBOARD.KEY_TWO) {
                this.setState({
                    numberBet: 2,
                });
            }
            if (e.keyCode === NUMPAD.KEY_THREE || e.keyCode === KEYBOARD.KEY_THREE) {
                this.setState({
                    numberBet: 3,
                });
            }
            this.numberBet();
        }
        if(this.state.playing === true) {
            if (e.keyCode === 82) { // "R" new game
                this.newGame();
            }

            switch (e.keyCode) {
                case 17: // new card for player
                    if( e.keyCode === 17) {
                        this.setState({
                            soundName: 'flip',
                            soundStatus: 'play'
                        });
                        this.sums();
                        this.startGameTimer = window.setTimeout(() => {
                            e.preventDefault();
                            if (this.state.selectedPackages < 9) {
                                this.numberPackages(this.state.selectedPackages +1);
                                this.nextCard();
                                if (this.state.voices) {
                                    window.responsiveVoice.speak(this.getNewDeckStatus(true), "Czech Female", { onend: this.addEventListeners });

                                    this.startGameTimer = window.setTimeout(() => {
                                        this.setState({
                                            playing: true,
                                        });
                                    });
                                }
                            }
                            this.sums();
                        },2000);

                        if(this.state.score < 0) {
                            window.responsiveVoice.speak("Konec hry už nemáte žetony ", "Czech Female");
                            this.removeEventListeners();
                        }
                    }
                    break;

                case 18: // read your card
                    if(e.keyCode === 18) {
                        e.preventDefault();
                        if (!this.state.voices) return;
                        if (this.state.voices) {
                            window.responsiveVoice.speak(this.getNewDeckStatus(true), "Czech Female", { onend: this.addEventListeners });

                            this.startGameTimer = window.setTimeout(() => {
                                this.setState({
                                    playing: true,
                                });
                            });
                        }
                    }
                    break;

                case 13: // stand => laying your card and compare to card dealer
                    if (e.keyCode === 13) {
                        this.setState({
                            showDeal:false

                        });
                        e.preventDefault();
                        this.sums();
                        this.nextCardForDealer();
                        if (this.state.sumsDealer < this.state.mySums && this.state.sumsDealer < 21) {

                            this.newCardForDealer();
                        }

                        this.compareSums();

                        if (this.state.voices) {
                            window.responsiveVoice.speak(this.getNewDeckStatus(true) + ' součet dealerových karet byl ' + this.state.sumsDealer, "Czech Female", {onend: this.addEventListeners});
                        }

                        if(this.state.score < 0) {
                            window.responsiveVoice.speak("Konec hry už nemáte žetony ", "Czech Female");
                            this.removeEventListeners();
                        }
                    }
                    break;

                case 32: // space bar new cards
                    if (e.keyCode === 32) {
                        if( this.state.selectedPackages > 2 ) {
                            this.setState({
                                selectedPackages: this.state.selectedPackages -1
                            });
                        }
                        let newScore = this.state.yourBet;
                        this.setState({
                            score: this.state.score - newScore,

                        });
                        this.newCards();
                        if(this.state.score < 0) {
                            window.responsiveVoice.speak("Konec hry už nemáte žetony ", "Czech Female");
                            this.setState({
                                playing: false,
                            });
                            this.removeEventListeners();
                        }
                    }
                    break;

                case 16: // read number remaining chips
                    if (e.keyCode === 16) {
                        window.responsiveVoice.speak("Zbývá vám " + this.state.score+ " žetonů" , "Czech Female");
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // function for your start bet
    numberBet () {
        let numberBet = this.state.numberBet;
        let yourBet;
        switch (numberBet) {
            case 1:
                yourBet = 5;
                break;

            case 2:
                yourBet = 10;
                break;

            case 3:
                yourBet = 20;
                break;

            default:
                break;

        }
        let infoBox = false;

        this.setState({
            infoBox,
            numberBet,
            yourBet: yourBet,
            // reset game
            playing: false,
            score: 100
        }, () => this.newGame());
    }

    // function for sums value your cards and dealer cards and compare value type "String" to number
    sums () {
        let dealSums = this.state.cardsDealer;
        let mySums = this.state.cards;
        for (let i=0; i < mySums.length; i++) {
            if (mySums[i] === 'Ace') {
                mySums[i] =11;
            }

            if(mySums[i]=== 'Jack' || mySums[i] === 'Queen' || mySums[i] === 'King') {
                mySums[i] =10;
            }
        }

        if (mySums[0] === 'Ace' && mySums[1] === 'Ace') {
            mySums[0] = 11;
            mySums[1] = 1;
        }

        for (let i=0; i < dealSums.length; i++) {
            if (dealSums[i] === 'Ace') {
                dealSums[i] = 11;
            }

            if(dealSums[i]=== 'Jack' || dealSums[i] === 'Queen' || dealSums[i] === 'King') {
                dealSums[i] =10;
            }

            if (dealSums[0] === 'Ace' && dealSums[1] === 'Ace') {
                dealSums[0] = 11;
                dealSums[1] = 1;
            }
        }

        let dealResult = dealSums.map(function (x) {
            return parseInt(x, 10);
        });

        let reducerDeal = (accumulator, currentValue) => accumulator + currentValue;
        let reducerAllDeal = dealResult.reduce(reducerDeal);

        let myResult = mySums.map(function (y) {
            return parseInt(y, 10);
        });

        let reducer = (accumulator, currentValue) => accumulator + currentValue;
        let reducerAll = myResult.reduce(reducer);

        this.setState({
            sumsDealer: reducerAllDeal,
            mySums: reducerAll
        });

        if (reducerAll > 21) {
            this.setState({
                score: this.state.score,
            });
            window.responsiveVoice.speak("Součet vašich karet je větší než 21 " + '  ' + " prohrál jsi" , "Czech Female");
        }

        if (dealSums[0] > 10) {
            for (let y=0; y < dealSums.length; y++) {
                if(dealSums[y] === 'Ace') {
                    dealSums[y]= 1;
                }
            }
            let dealResultRepeat = dealSums.map(function (x) {
                return parseInt(x, 10);
            });
            let reducerDealRepeat = (accumulator, currentValue) => accumulator + currentValue;
            let reducerAllDealRepeat = dealResultRepeat.reduce(reducerDealRepeat);
            this.setState({
                sumsDealer: reducerAllDealRepeat,
            });
        }

        if (mySums[0] > 10) {
            for (let y=0; y < mySums.length; y++) {
                if(mySums[y] === 'Ace') {
                    mySums[y]= 1;
                }
            }
            let myResultRepeat = mySums.map(function (y) {
                return parseInt(y, 10);
            });
            let reducerAllRepeat = (accumulator, currentValue) => accumulator + currentValue;
            let reducerMyAllRepeat = myResultRepeat.reduce(reducerAllRepeat);
            this.setState({
                mySums: reducerMyAllRepeat,

            });
        }
}

    // condition for generate next card for dealer
    nextCardForDealer () {
       let dealSum= this.state.sumsDealer;
       let mySum = this.state.mySums;

       if (dealSum < mySum) {
           this.newCardForDealer();
           this.sums();
       }
       this.sums();
    }


    // compare sums your card values and dealer card values
    compareSums () {
        let sumsDealer = this.state.sumsDealer;
        let mySums = this.state.mySums;
        let newScore = this.state.yourBet;
        if (mySums > 11) {
            for (let i=0; i < mySums.length; i++) {
                if (mySums[i] === 'Ace') {
                    mySums[i] =1;
                    this.sums()
                }
            }
        }
        if (mySums > sumsDealer || mySums === 21) {
            this.setState({
                score: this.state.score + (2*newScore),
                soundStatus: 'play',
                soundName: 'success'
            });
        }

        if (mySums < sumsDealer) {
            this.setState({
                score: this.state.score,
                soundStatus: 'play',
                soundName: 'failure'
            });
        }

        if (mySums === sumsDealer) {
            this.setState({
                score: this.state.score,
                soundStatus: 'play',
                soundName: 'failure'
            });
        }

        if (sumsDealer > 21) {
            this.setState({
                score: this.state.score + (2*newScore),
                soundStatus: 'play',
                soundName: 'success'
            });
        }
    }

    // generate new cards for you and for dealer
    newCards () {
        let selectedPackages = 2;
        let cards = [];
        let cardsDealer = [];
        let newActiveCard = this.generateNewCardV2();
        let newActiveCard2 = this.generateNewCardV2();
        this.state.cards.splice(0, this.state.cards.length);
        this.state.cardsDealer.splice(0, this.state.cardsDealer.length);


        // first deck will always be there => generate card
        let cardDeckOne = this.generateNewCardV2();

        // if selectedPackages if more than 1 => fill the other decks
        let cardDeckTwo =
            selectedPackages === 2
                ? this.generateNewCardV2()
                : null;

        if (cardDeckOne.cardValue && cardDeckOne.color === cardDeckTwo.cardValue && cardDeckTwo.color) {
             cardDeckOne = this.generateNewCardV2();
            cardDeckTwo =
                selectedPackages === 2
                    ? this.generateNewCardV2()
                    : null;
        }
        this.setState({
            cardActive1_value: newActiveCard.cardValue,
            cardActive1_color: newActiveCard.color,

            cardDeck1_value: cardDeckOne.cardValue,
            cardDeck1_color: cardDeckOne.color,

            [newActiveCard2 ? 'cardActive2_value' : null]: newActiveCard2 ? newActiveCard2.cardValue : null,
            [newActiveCard2 ? 'cardActive2_color' : null]: newActiveCard2 ? newActiveCard2.color : null,
            // save only those decks which are needed for the game
            [cardDeckTwo ? 'cardDeck2_value' : null]: cardDeckTwo ? cardDeckTwo.cardValue : null,
            [cardDeckTwo ? 'cardDeck2_color' : null]: cardDeckTwo ? cardDeckTwo.color : null,

            score: this.state.score,
        });

        cards.push(cardDeckOne.cardValue, cardDeckTwo.cardValue);
        cardsDealer.push(newActiveCard.cardValue, newActiveCard2.cardValue);
        this.setState({
          cards: cards,
          cardsDealer: cardsDealer,
        });
        if (this.state.voices) {
            window.responsiveVoice.speak(this.getNewDeckStatus(true), "Czech Female", { onend: this.addEventListeners });

            this.startGameTimer = window.setTimeout(() => {
                this.setState({
                    playing: true,
                    selectedPackages: selectedPackages,
                    packagesForDealer: selectedPackages,
                    showDeal: true
                });
            },);
        }
    }

    // this generate new card for dealer
    newCardForDealer() {
        this.numberPackagesDeal(this.state.packagesForDealer +1);
        let selectedPackages = this.state.packagesForDealer;
        for (let i=0; i< 10; i++) {
            let cardActive =
                selectedPackages === i
                    ? this.generateNewCardV2()
                    : null;
            this.setState(() => {
                return {
                    // save only those decks which are needed for the game
                    [cardActive ? `cardActive${i}_value` : null]: cardActive ? cardActive.cardValue : null,
                    [cardActive ? `cardActive${i}_color` : null]: cardActive ? cardActive.color : null,
                }
            });

            if(selectedPackages === i) {
                this.state.cardsDealer.push(cardActive.cardValue);
                this.sums();
            }
        }
    }

    // change number packages
    numberPackages (packages = 2) {
        this.setState({
            playing: true,
            selectedPackages: packages
        })
    }

    // change number packages
    numberPackagesDeal (packages = 2) {
        this.setState({
            playing: true,
            packagesForDealer: packages
        })
    }

    // this generate new card or cards for you
    nextCard () {
        let selectedPackages = this.state.selectedPackages;
        for (let i=0; i< 10; i++) {
            let cardDeck =
                selectedPackages === i
                    ? this.generateNewCardV2()
                    : null;
            this.setState(() => {
                return {
                    // save only those decks which are needed for the game
                    [cardDeck ? `cardDeck${i}_value` : null]: cardDeck ? cardDeck.cardValue : null,
                    [cardDeck ? `cardDeck${i}_color` : null]: cardDeck ? cardDeck.color : null,
                }
            });
            if(selectedPackages === i) {
                this.state.cards.push(cardDeck.cardValue);
            }
        }
    }

    // handle keyUp - read new generated card
    handleKeyUp(e) {
        if (!this.state.playing) return;

    }

    // handle finish sound playing
    handleFinishedPlaying() {
        this.setState({
            soundStatus: 'stop'
        });
    }

    // init new game
    newGame() {
        // number of selected packages
        const { selectedPackages } = this.state;
        const { packagesForDealer } = this.state;
        let cards = [];
        let cardsDealer = [];
        // random active card
        let newActiveCard = this.generateNewCardV2();
        let newActiveCard2 =
            packagesForDealer === 2
                ? this.generateNewCardV2()
                : null;

        // first deck will always be there => generate card
        let cardDeckOne = this.generateNewCardV2();

        // if selectedPackages if more than 1 => fill the other decks
        let cardDeckTwo =
            selectedPackages === 2
                ? this.generateNewCardV2()
                : null;

        this.setState(() => {
                return {
                    playing: true,
                    cardActive1_value: newActiveCard.cardValue,
                    cardActive1_color: newActiveCard.color,

                    cardDeck1_value: cardDeckOne.cardValue,
                    cardDeck1_color: cardDeckOne.color,

                    [newActiveCard2 ? 'cardActive2_value' : null]: newActiveCard2 ? newActiveCard2.cardValue : null,
                    [newActiveCard2 ? 'cardActive2_color' : null]: newActiveCard2 ? newActiveCard2.color : null,

                    // save only those decks which are needed for the game
                    [cardDeckTwo ? 'cardDeck2_value' : null]: cardDeckTwo ? cardDeckTwo.cardValue : null,
                    [cardDeckTwo ? 'cardDeck2_color' : null]: cardDeckTwo ? cardDeckTwo.color : null,

                    score: 100 - this.state.yourBet,

                    [!this.state.voices ? 'playing' : null]: !this.state.voices ? true : null
                };
            }, () => {
                if (this.state.voices) {
                    window.responsiveVoice.speak(this.getDeckStatus(true), "Czech Female", { onend: this.addEventListeners });
                    this.sums();

                    this.startGameTimer = window.setTimeout(() => {
                        this.setState({
                            playing: true,
                        });
                    },);
                }
            }
        );
        this.buttonRefresh.blur();
        cards.push(cardDeckOne.cardValue, cardDeckTwo.cardValue);
        cardsDealer.push(newActiveCard.cardValue, newActiveCard2.cardValue);
        this.setState({
            cards: cards,
            cardsDealer: cardsDealer,
        });
    }

    renderPackages(count) {
        let packages = [];

        for (let i = 1; i < count + 1; i++) {
            let template = (
                <div className="card-box" key={i}>
                    <Card value={this.state[`cardDeck${i}_value`]} color={this.state[`cardDeck${i}_color`]}/>
                </div>
            );
            packages.push(template);
        }
        return packages;
    }

    renderDealPackages(count) {
        const {
            showDeal
        } = this.state;
        let packagesDealer = [];

        for (let i = 1; i < count + 1; i++) {
            let template2 = (
                <div className={showDeal ? 'card-box card-active' : 'card-box card-active show'} key={i}>
                    <Card value={this.state[`cardActive${i}_value`]} color={this.state[`cardActive${i}_color`]}/>
                </div>
            );
            packagesDealer.push(template2);
        }
        return packagesDealer;
    }

    render() {
        const {
            display,
            sounds: stateSounds,
            voices
        } = this.state;

        let iconVoices = voices ? <FontAwesome name='toggle-on' size='2x' /> : <FontAwesome name='toggle-off' size='2x' />;
        const iconSounds = stateSounds ? <FontAwesome name='volume-up' size='2x' /> : <FontAwesome name='volume-off' size='2x' />;
        let iconDisplay = display ? <FontAwesome name='eye-slash' size='4x' /> : <FontAwesome name='eye' size='4x' />;

        const packages = this.renderPackages(this.state.selectedPackages);
        const packagesDealer = this.renderDealPackages(this.state.packagesForDealer);

        return (
            <div className="Game" role="application" ref={(div) => this.app = div}>
                <header>

                    <div className="options">
                        <button onClick={() => this.newGame()} ref={(buttonRefresh) => { this.buttonRefresh = buttonRefresh; }}>
                            <FontAwesome name='refresh' size='2x' />
                        </button>

                        <button onClick={this.turnSound} ref={(buttonSounds) => { this.buttonSounds = buttonSounds; }}>
                            {iconSounds}
                        </button>

                        <button className="speech-btn" onClick={this.turnVoices} ref={(buttonVoices) => { this.buttonVoices = buttonVoices; }}>
                            {iconVoices}
                            <span>číst</span>
                        </button>
                    </div>
                </header>

                <div className={display ? 'BlackJack__area' : 'BlackJack__area blur'}>

                    {
                        !this.state.display
                            ? <div className="overlay"/>
                            : null
                    }
                    <div id="Selected" style={{ display: this.state.infoBox ? "flex" : "none" }}   >
                        <p> Zvol si výši svých sázek pomocí číselných kláves 1 až 3</p>
                    </div>
                    <div className="Card__container three-box">
                        {packagesDealer}
                    </div>
                    <div className="Card__container three-box">
                        {packages}
                    </div>
                </div>

                <div className="score">
                    {this.state.score}
                    <span> <img src={chip} className="chips"/></span>
                </div>

                <div className="options options-display">
                    <button onClick={this.controlDisplay} ref={(buttonDisplay) => this.buttonDisplay = buttonDisplay}>
                        {iconDisplay}
                    </button>
                </div>


                {
                    !this.state.sounds || this.state.soundStatus !== 'play'
                        ? null
                        : <Sound
                        url={select_sound(sounds, this.state.soundName).url}
                        playStatus={'PLAYING'}
                        volume={30}
                        onFinishedPlaying={this.handleFinishedPlaying}
                    />
                }

                <footer>
                </footer>
            </div>
        );
    }

    getDeckStatus(textSwitch) {
        let text = "";
        let cardActiveStr = "";
        if (textSwitch) {
            cardActiveStr = this.reader(this.state.cardActive1_value);
            text = 'Dealerova první karta je ' + cardActiveStr.valueStr + ' a ' +'vaše karty jsou ';

        } else {
            text = "";
        }

        if(this.state.voices) {
            for (let i = 1; i < this.state.selectedPackages + 1; i++) {
                let reader = this.reader(this.state[`cardDeck${i}_value`]);
                text += reader.valueStr + ' ';
            }
            return text;
        }
        return text;
    }

    getNewDeckStatus(textSwitch) {
        let text = "";
        if (textSwitch) {
            text = 'Vaše karty jsou ';
        } else {
            text = "";
        }

        if(this.state.voices) {
            for (let i = 1; i < this.state.selectedPackages +1; i++) {
                let reader = this.reader(this.state[`cardDeck${i}_value`]);
                text += reader.valueStr + ' ';
            }
            return text;
        }
        return text;
    }

    // function for read czech translate value cards or converted string number to czech string
    reader(cardValue) {
        let cardStrings = {
            valueStr: '',
        };

        switch(cardValue) {
            case 'Ace':
                cardStrings.valueStr = "eso";
                break;
            case '2':
                cardStrings.valueStr = "dvojka";
                break;
            case '3':
                cardStrings.valueStr = "trojka";
                break;
            case '4':
                cardStrings.valueStr = "čtyřka";
                break;
            case '5':
                cardStrings.valueStr = "pětka";
                break;
            case '6':
                cardStrings.valueStr = "šestka";
                break;
            case '7':
                cardStrings.valueStr = "sedmička";
                break;
            case '8':
                cardStrings.valueStr = "osmička";
                break;
            case '9':
                cardStrings.valueStr = "devítka";
                break;
            case '10':
                cardStrings.valueStr = "desítka";
                break;
            case 'Jack':
                cardStrings.valueStr = "kluk";
                break;
            case 'Queen':
                cardStrings.valueStr = "dáma";
                break;
            case 'King':
                cardStrings.valueStr = "král";
                break;
            default:
                cardStrings.valueStr = "karta nenalezena"
        }

        return cardStrings;
    }

    // return index of card
    getCardIndex(value) {
        let cards = cardStack;
        for (let i = 0; i < cards.length; i++) {
            if (cards[i] === value) {
                return i;
            }
        }
    }

    onEnd() {
        this.setState({
            playing: true
        });
    }
}

export default Game;