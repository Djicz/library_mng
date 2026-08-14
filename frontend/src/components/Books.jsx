import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({ name: '', category: '' });
  const navigate = useNavigate();

  const fetchBooks = async (searchTerm = '') => {
    try {
      const response = await api.get(`/manager/books${searchTerm ? '?search=' + searchTerm : ''}`);
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.delete(`/manager/books/${id}`);
        fetchBooks();
      } catch (error) {
        console.error("Error deleting book", error);
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/manager/books', newBook);
      setNewBook({ name: '', category: '' });
      setShowAddForm(false);
      fetchBooks();
    } catch (error) {
      console.error("Error adding book", error);
    }
  };

  return (
    <div>
      <h2>Book List</h2>
      
      {!showAddForm && (
        <button className="btn btn-success mb-3" onClick={() => setShowAddForm(true)}>Add New Book</button>
      )}

      {showAddForm && (
        <div className="card mb-4">
          <div className="card-header">Add New Book</div>
          <div className="card-body">
            <form onSubmit={handleAddSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" value={newBook.name} onChange={e => setNewBook({...newBook, name: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <input type="text" className="form-control" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary me-2">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
      
      <form className="d-flex mb-3" onSubmit={handleSearch}>
        <input className="form-control me-2" type="search" placeholder="Search by name" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-outline-success" type="submit">Search</button>
      </form>
      
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.name}</td>
              <td>{book.category}</td>
              <td>{book.status}</td>
              <td>
                {book.status === 'AVAILABLE' && (
                  <button className="btn btn-primary btn-sm me-2" onClick={() => navigate('/manager/borrows?assignBookId=' + book.id)}>Assign</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
