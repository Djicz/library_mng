import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkAddForm, setShowBulkAddForm] = useState(false);
  const [bulkBooksJson, setBulkBooksJson] = useState('[\n  {\n    "name": "Book Name",\n    "category": { "id": "category-id" },\n    "quantity": 1\n  }\n]');
  const [bulkError, setBulkError] = useState('');
  const [newBook, setNewBook] = useState({ name: '', category: '', quantity: 1 });
  const [editBookId, setEditBookId] = useState(null);
  const [editBookData, setEditBookData] = useState({ name: '', category: '', quantity: 1 });
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

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    try {
      const parsedData = JSON.parse(bulkBooksJson);
      if (!Array.isArray(parsedData)) {
        setBulkError('Data must be a JSON array');
        return;
      }
      await api.post('/manager/books/in-books', parsedData);
      setShowBulkAddForm(false);
      fetchBooks();
    } catch (error) {
      console.error("Error adding bulk books", error);
      setBulkError(error.message || 'Invalid JSON or Server Error');
    }
  };

  const startEdit = (book) => {
    setEditBookId(book.id);
    setEditBookData({
      name: book.name,
      category: book.category?.id || '',
      quantity: book.quantity
    });
  };

  const cancelEdit = () => {
    setEditBookId(null);
    setEditBookData({ name: '', category: '', quantity: 1 });
  };

  const handleEditSubmit = async (id) => {
    try {
      const bookData = { ...editBookData, category: { id: editBookData.category } };
      await api.put(`/manager/books/update/${id}`, bookData);
      setEditBookId(null);
      fetchBooks();
    } catch (error) {
      console.error("Error updating book", error);
      alert("Error updating book");
    }
  };

  return (
    <div>
      <h2>Book List</h2>
      
      {!showAddForm && !showBulkAddForm && (
        <div className="mb-3">
          <button className="btn btn-success me-2" onClick={() => setShowAddForm(true)}>Add New Book</button>
          <button className="btn btn-info text-white" onClick={() => setShowBulkAddForm(true)}>Bulk Import Books</button>
        </div>
      )}

      {showBulkAddForm && (
        <div className="card mb-4">
          <div className="card-header bg-info text-white">Bulk Import Books (JSON)</div>
          <div className="card-body">
            {bulkError && <div className="alert alert-danger">{bulkError}</div>}
            <form onSubmit={handleBulkSubmit}>
              <div className="mb-3">
                <label className="form-label">Paste JSON Array of Books</label>
                <textarea 
                  className="form-control" 
                  rows="10" 
                  value={bulkBooksJson} 
                  onChange={e => setBulkBooksJson(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary me-2">Save All</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowBulkAddForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
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
              {editBookId === book.id ? (
                <>
                  <td>
                    <input type="text" className="form-control" value={editBookData.name} onChange={e => setEditBookData({...editBookData, name: e.target.value})} />
                  </td>
                  <td>
                    <select className="form-select" value={editBookData.category} onChange={e => setEditBookData({...editBookData, category: e.target.value})}>
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="number" className="form-control" value={editBookData.quantity} onChange={e => setEditBookData({...editBookData, quantity: parseInt(e.target.value) || 0})} min="0" />
                  </td>
                  <td>
                    <button className="btn btn-success btn-sm me-2" onClick={() => handleEditSubmit(book.id)}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{book.name}</td>
                  <td>{book.category?.name}</td>
                  <td>{book.quantity}</td>
                  <td>
                    {book.quantity > 0 && (
                      <button className="btn btn-primary btn-sm me-2" onClick={() => navigate('/manager/borrows?assignBookId=' + book.id)}>Assign</button>
                    )}
                    <button className="btn btn-warning btn-sm me-2" onClick={() => startEdit(book)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
