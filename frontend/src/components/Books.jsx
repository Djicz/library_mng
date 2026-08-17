import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({ name: '', category: '', quantity: 1 });
  const [categories, setCategories] = useState([]);
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
    const fetchCategories = async () => {
      try {
        const response = await api.get('/manager/category');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
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
      const bookData = { ...newBook, category: { id: newBook.category } };
      await api.post('/manager/books', bookData);
      setNewBook({ name: '', category: '', quantity: 1 });
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
                <select className="form-select" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} required>
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input type="number" className="form-control" value={newBook.quantity} onChange={e => setNewBook({...newBook, quantity: parseInt(e.target.value) || 0})} min="0" required />
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
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.name}</td>
              <td>{book.category?.name}</td>
              <td>{book.quantity}</td>
              <td>
                {book.quantity > 0 && (
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
