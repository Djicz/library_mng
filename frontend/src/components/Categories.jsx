import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await api.get('/manager/category');
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      try {
        await api.delete(`/manager/category/del/${id}`);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category", error);
        alert(error.response?.data || "Không thể xóa thể loại");
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/manager/category/add', { name: newCategoryName });
      setNewCategoryName('');
      setShowAddForm(false);
      fetchCategories();
    } catch (error) {
      console.error("Error adding category", error);
      setError(error.response?.data || "Lỗi khi thêm thể loại");
    }
  };

  const startEdit = (category) => {
    setEditCategoryId(category.id);
    setEditCategoryName(category.name);
  };

  const cancelEdit = () => {
    setEditCategoryId(null);
    setEditCategoryName('');
  };

  const handleEditSubmit = async (id) => {
    try {
      await api.post(`/manager/category/update/${id}`, { name: editCategoryName });
      setEditCategoryId(null);
      setEditCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error("Error updating category", error);
      alert(error.response?.data || "Lỗi khi cập nhật thể loại");
    }
  };

  return (
    <div>
      <h2>Quản lý Thể loại</h2>
      
      {!showAddForm && (
        <div className="mb-3">
          <button className="btn btn-success" onClick={() => setShowAddForm(true)}>Thêm Thể loại mới</button>
        </div>
      )}

      {showAddForm && (
        <div className="card mb-4">
          <div className="card-header">Thêm Thể loại</div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleAddSubmit}>
              <div className="mb-3">
                <label className="form-label">Tên Thể loại</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary me-2">Lưu</button>
              <button type="button" className="btn btn-secondary" onClick={() => {setShowAddForm(false); setError('');}}>Hủy</button>
            </form>
          </div>
        </div>
      )}
      
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Tên Thể loại</th>
            <th style={{width: '200px'}}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>
                {editCategoryId === cat.id ? (
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editCategoryName} 
                    onChange={(e) => setEditCategoryName(e.target.value)} 
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td>
                {editCategoryId === cat.id ? (
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={() => handleEditSubmit(cat.id)}>Lưu</button>
                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => startEdit(cat)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan="2" className="text-center text-muted">Không có thể loại nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Categories;
