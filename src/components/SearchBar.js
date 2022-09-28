import React, { useState, useEffect } from 'react';

export default function SearchBar(props) {

  const [text, setText] = useState('');
  const [textValidity, setTextValidity] = useState(true);
  let update = null;

  const validate = (val) => {
    if (/^[A-Za-z0-9 _!.,?"'-]{0,100}$/.test(val)) {
      setTextValidity(true);
      return true;
    } else {
      setTextValidity(false);
      return false;
    }
  };

  const onSearchBarChange = (e) => {
    let valid = validate(e.target.value);
    props.onSearchBarChange(e.target.value, valid);
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

  return (
    <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
      <div className="mb-4">
        <input 
          type="text"
          id="searchBar"
          className={textValidity ? "form-control" : "form-control is-invalid"}
          autoComplete="off"
          maxLength="100"
          value={text}
          onChange={(e) => debounceChange(e)()}
        />
        { !textValidity &&
          <div className="invalid-feedback">Text can only contain valid characters and must be less than 100 characters.</div>
        }
      </div>
    </form>
  );
}
