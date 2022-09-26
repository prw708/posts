import React, { useState, useEffect } from 'react';

export default function SearchBar(props) {

  const [text, setText] = useState('');
  let update = null;

  const onSearchBarChange = (e) => {
    props.onSearchBarChange(e.target.value);
  };

  const debounceChange = (e) => {
    setText(e.target.value);
    return function() {
      clearTimeout(update);
      update = setTimeout(function() {
        update = null;
        onSearchBarChange(e);
      }, 1000);
    };
  };

  useEffect(() => {
    setText(props.searchText);
  }, [props.searchText]);

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
          onChange={(e) => debounceChange(e)()}
        />
      </div>
    </form>
  );
}
