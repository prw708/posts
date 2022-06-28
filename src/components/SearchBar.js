import React, { useState } from 'react';

export default function SearchBar(props) {

  const [text, setText] = useState('');

  const onSearchBarChange = (e) => {
    e.preventDefault();
    setText(e.target.value);
    props.onSearchBarChange(e.target.value);
  };

  return (
    <form className="mt-4">
      <div className="mb-4">
        <input 
          type="text"
          id="searchBar"
          className="form-control"
          autoComplete="off"
          maxLength="100"
          value={text}
          onChange={onSearchBarChange}
        />
      </div>
    </form>
  );
}
