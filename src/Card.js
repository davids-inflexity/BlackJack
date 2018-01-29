import React, { Component } from 'react';
import './Card.css';

class Card extends Component {

    render() {
        let cardClass, cardColor = "";

        if (this.props.color === 0) {
            cardClass = "Card card--black cross";
            cardColor = "black"
        }
        if(this.props.color === 1) {
            cardClass = "Card card--red heart";
            cardColor = "red"
        }
        if (this.props.color === 2) {
            cardClass = "Card card--black leaves";
            cardColor = "black"
        }
        if(this.props.color === 3) {
            cardClass = "Card card--red peaks";
            cardColor = "black"
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