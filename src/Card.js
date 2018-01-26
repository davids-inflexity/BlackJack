import React, { Component } from 'react';
import './Card.css';

class Card extends Component {

    render() {
        let cardClass, cardColor = "";

        if (this.props.color === 0) {
            cardClass = "Card card--black";
            cardColor = "black"
        } else {
            cardClass = "Card card--red"
            cardColor = "red"
        }

        return (
            <div className={cardClass}>
                <p className="Card__label">
                    <span className="Card__value">
                        {this.props.value}
                    </span>
                    <br />
                    <span className="Card__color">
                        {cardColor}
                    </span>
                </p>
            </div>
        );
    }
}

export default Card;