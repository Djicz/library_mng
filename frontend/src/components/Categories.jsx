import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Tag, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

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

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thể loại "${name}"?`)) {
      try {
        await api.delete(`/manager/category/del/${id}`);
        triggerSuccess(`Đã xóa thể loại "${name}" thành công.`);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category", error);
        alert(error.response?.data || "Không thể xóa thể loại (có thể đang có sách thuộc thể loại này).");
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/manager/category/add', { name: newCategoryName });
      setNewCategoryName('');
      setShowAddModal(false);
      triggerSuccess('Thêm thể loại sách mới thành công!');
      fetchCategories();
    } catch (error) {
      console.error("Error adding category", error);
      setError(error.response?.data || "Lỗi khi thêm thể loại.");
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
      triggerSuccess('Cập nhật tên thể loại thành công!');
      fetchCategories();
    } catch (error) {
      console.error("Error updating category", error);
      alert(error.response?.data || "Lỗi khi cập nhật thể loại.");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Quản Lý Thể Loại Sách
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Phân loại danh mục sách giúp độc giả dễ dàng tìm kiếm và tra cứu
          </p>
        </div>

        <div>
          <button 
            className="btn-primary-gradient" 
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            <span>Thêm Thể Loại Mới</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="badge-status badge-status-success w-100 mb-3" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Table Categories */}
      <div className="table-modern-wrapper">
        <table className="table-modern">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>STT</th>
              <th>Tên Thể Loại</th>
              <th style={{ width: '220px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat.id}>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                    #{index + 1}
                  </span>
                </td>
                <td>
                  {editCategoryId === cat.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '400px' }}>
                      <input 
                        type="text" 
                        className="form-control-custom" 
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.9rem' }}
                        value={editCategoryName} 
                        onChange={(e) => setEditCategoryName(e.target.value)} 
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tag size={16} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {cat.name}
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {editCategoryId === cat.id ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        className="btn-primary-gradient" 
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => handleEditSubmit(cat.id)}
                      >
                        <Check size={14} />
                        <span>Lưu</span>
                      </button>
                      <button 
                        className="btn-secondary-modern" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                        onClick={cancelEdit}
                      >
                        <X size={14} />
                        <span>Hủy</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        className="btn-action-icon btn-action-edit" 
                        title="Chỉnh sửa tên thể loại"
                        onClick={() => startEdit(cat)}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        className="btn-action-icon btn-action-delete" 
                        title="Xóa thể loại"
                        onClick={() => handleDelete(cat.id, cat.name)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <FolderTree size={42} style={{ opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Chưa có thể loại sách nào.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add Category */}
      {showAddModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                <Plus size={20} style={{ color: 'var(--primary-light)' }} />
                <span>Thêm Thể Loại Sách Mới</span>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body-custom">
                {error && (
                  <div className="badge-status badge-status-danger w-100 mb-3" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group-custom">
                  <label className="form-label-custom">Tên Thể Loại <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    placeholder="Ví dụ: Khoa học công nghệ, Kinh tế, Văn học..."
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)} 
                    required 
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-modern" 
                  onClick={() => { setShowAddModal(false); setError(''); }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary-gradient">
                  <span>Tạo Thể Loại</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
