const InvitePeople = () => (
    <div>
        <div className = { 'guest' }>
            <input
                type = 'text'
                className = { 'guest-input' }
                placeholder = { 'Guest Name' }
                onChange = { event => setGuestName(event.target.value) } />
            <p style = {{ color: 'red' }}>{nameValid}</p>
        </div>
        <div className = { 'share-email' }>
            <input
                type = 'text'
                className = { 'share-input' }
                placeholder = { 'Enter email to share invitation' }
                onChange = { event => setEmailInput(event.target.value) } />
            <p style = {{ color: 'red' }}>{emailValid}</p>
        </div>
    </div>
);

export default InvitePeople;
