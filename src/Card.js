import React, { Component } from 'react';
import './Card.css';

class Card extends Component {

    render() {
        let cardClass;

        if (this.props.color === 0) {
            cardClass = "Card card--black cross";
        }
        if(this.props.color === 1) {
            cardClass = "Card card--red heart";
        }
        if (this.props.color === 2) {
            cardClass = "Card card--black leaves";
        }
        if(this.props.color === 3) {
            cardClass = "Card card--red peaks";
        }

        return (
            <div className={cardClass}>
                <p className="Card__label">
                    <span className="Card__value">
                        {this.props.value}
                    </span>
                    <br />
                </p>
            </div>
        );
    }
}

export default Card;