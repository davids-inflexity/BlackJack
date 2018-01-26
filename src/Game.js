import React, { Component } from 'react';
import Card from './Card.js';
import sounds from './sounds.js';
import { randomNumber, select_sound } from './helpers.js';
import Sound from 'react-sound';

import './Game.css';
import './helpers.css';

var FontAwesome = require('react-fontawesome');

const cardStack = ['Ace','2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

class Game extends Component {
    constructor(props){
        super(props);

        this.state = {
            // is game on?
            playing: false,
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

            dealNum1:'',
            dealNum2:'',
            sumsDealer: '',
            mySums: '',
        };

        this.turnVoices = this.turnVoices.bind(this);
        this.turnSound = this.turnSound.bind(this);
        this.controlDisplay = this.controlDisplay.bind(this);

        // handle time update from timer

        // handle keys
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        this.newGame = this.newGame.bind(this);
        this.numberPackages = this.numberPackages.bind(this);
        this.handleFinishedPlaying = this.handleFinishedPlaying.bind(this);
        this.removeEventListeners = this.removeEventListeners.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);
        this.onEnd = this.onEnd.bind(this);
    }

    componentDidMount() {
        this.addEventListeners();
        this.newGame();
    }

    componentWillUnmount() {
        // remove key listener
        this.removeEventListeners();
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
        const randomColor = randomNumber(0, 2);
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
                const newCardColor =
                    // 1 - black
                    // 0 - red
                    card.color === 0 ? 1 : 0;

                // card index of current card
                newCard.cardValue = cardStack[currentCardIndex - 1];
                newCard.color = newCardColor;
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
        e.preventDefault();

        // select which card package should be compared or handle other pressed key
        switch (e.keyCode) {
            // other keys
            case 17:
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
                        }, 2150 * this.state.selectedPackages);
                    }
                }
                this.mySums();
                this.dealSums();

                break;
            case 18:
                e.preventDefault();
                if (!this.state.voices) return;

                break;

            case 13:
                this.setState({
                    showDeal:false

                });
                e.preventDefault();
                this.sums();
                window.responsiveVoice.speak("Dealerovi karty byly " + this.state.cardActive_value + ' a ' + this.state.cardActive_value2, "Czech Female");
                this.compareSums();
                if (this.state.packagesForDealer < 9) {
                    this.newCardForDealer();
                }
                this.newCards();

                if(this.state.score === 0) {
                    window.responsiveVoice.speak("Konec hry už nemáte žetony ", "Czech Female");
                    this.removeEventListeners();
                }
                break;
            default:
                break;
        }
    }

    sums () {
        let dealSums = this.state.cardsDealer;
        let mySums = this.state.cards;
        for (let i=0; i < mySums.length; i++) {
            if (mySums[i] === 'Ace') {
                mySums[i] = 11;
            }

            if(mySums[i]=== 'Jack' || mySums[i] === 'Queen' || mySums[i] === 'King') {
                mySums[i] =10;
            }
        }

        for (let i=0; i < dealSums.length; i++) {
            if (dealSums[i] === 'Ace') {
                dealSums[i] = 11;
            }

            if(dealSums[i]=== 'Jack' || dealSums[i] === 'Queen' || dealSums[i] === 'King') {
                mySums[i] =10;
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
}

    mySums () {
        this.sums();
        let mySums = this.state.mySums;
        let newScore = 10;
        if (mySums > 21) {
            this.setState({
                score: this.state.score - newScore,
                selectedPackages: 2,
                packagesForDealer: 2,
            });
            this.newCards();
        }

        if (mySums === 21) {
            this.setState({
                score: this.state.score + (2*newScore),
                selectedPackages: 2,
                packagesForDealer: 2,
            });
            this.newCards();
        }
    }

    dealSums () {
        this.sums();
        let dealSums = this.state.sumsDealer;
        let newScore = 10;

        if (dealSums === 21) {
            this.setState({
                score: this.state.score - newScore,
                packagesForDealer: 2,
            });
            this.newCards();
        }
    }

    compareSums () {
        let sumsDealer = this.state.sumsDealer;
        let mySums = this.state.mySums;
        let newScore = 10;
        if (mySums > sumsDealer && mySums <=21) {
            this.setState({
                score: this.state.score + (2*newScore)
            });
        }

        if (mySums < sumsDealer && sumsDealer <=21) {
            this.setState({
                score: this.state.score - newScore
            });
        }

        if (mySums === sumsDealer) {
            this.setState({
                score: this.state.score - newScore
            });
        }

        if (mySums > 21) {
            this.setState({
                score: this.state.score - newScore
            });
        }

        if (sumsDealer > 21) {
            this.setState({
                score: this.state.score + (2*newScore)
            });
        }

        if (sumsDealer < mySums && sumsDealer <= 17) {
            this.newCardForDealer();
        }
    }

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
        if (this.state.voices) {
            window.responsiveVoice.speak(this.getDeckStatus(true), "Czech Female", { onend: this.addEventListeners });

            this.startGameTimer = window.setTimeout(() => {
                this.setState({
                    playing: true,
                    selectedPackages: selectedPackages,
                    packagesForDealer: selectedPackages,
                    showDeal: true,
                });
            }, 2150 * this.state.selectedPackages);
        }
        cards.push(cardDeckOne.cardValue, cardDeckTwo.cardValue);
        this.state.cards = cards;

        cardsDealer.push(newActiveCard.cardValue, newActiveCard2.cardValue);
        this.state.cardsDealer = cardsDealer;
    }

    newCardForDealer() {
        this.numberPackagesDeal(this.state.packagesForDealer +1);
        let selectedPackages = this.state.packagesForDealer;
        let i;
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

    nextCard () {
        let selectedPackages = this.state.selectedPackages;
        let i;
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
        let cardsD = [];
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

                    score: 100,

                    [!this.state.voices ? 'playing' : null]: !this.state.voices ? true : null
                };
            }, () => {
                if (this.state.voices) {
                    window.responsiveVoice.speak(this.getDeckStatus(true), "Czech Female", { onend: this.addEventListeners });

                    this.startGameTimer = window.setTimeout(() => {
                        this.setState({
                            playing: true,
                        });
                    }, 2150 * this.state.selectedPackages);
                }
            }
        );
        this.buttonRefresh.blur();
        cards.push(cardDeckOne.cardValue, cardDeckTwo.cardValue);
        this.state.cards = cards;

        cardsD.push(newActiveCard.cardValue, newActiveCard2.cardValue);
        this.state.cardsDealer = cardsD;

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
            playing,
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
                        <button onClick={() => this.numberPackages()} ref={(buttonRefresh) => { this.buttonRefresh = buttonRefresh; }}>
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

                    <div className="Card__container three-box">
                        {packagesDealer}
                    </div>
                    <div className="Card__container three-box">
                        {packages}
                    </div>
                </div>

                <div className="score">
                    {this.state.score}
                    <span> Chips</span>
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

    /**
     * Return string of cards
     * @param {*} textSwitch
     * @returns {string}
     */
    getDeckStatus(textSwitch) {
        let text = "";
        let cardActiveStr = "";
        if (textSwitch) {
            cardActiveStr = this.reader(this.state.cardActive1_value);
            text = 'Dealerova první karta je ' + cardActiveStr.valueStr + ' ' +' Vaše karty jsou ';
        } else {
            text = "";
        }

        if(this.state.voices) {
            for (let i = 1; i < this.state.selectedPackages + 1; i++) {
                let reader = this.reader(this.state[`cardDeck${i}_value`]);
                text += reader.valueStr;
            }
            return text;
        }

        return text;
    }

    getNewDeckStatus(textSwitch) {
        let text = "";
        if (textSwitch) {
            text = ' Vaše karty jsou ';
        } else {
            text = "";
        }

        if(this.state.voices) {
            for (let i = 1; i < this.state.selectedPackages + 1; i++) {
                let reader = this.reader(this.state[`cardDeck${i}_value`]);
                text += reader.valueStr;
            }
            return text;
        }

        return text;
    }

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