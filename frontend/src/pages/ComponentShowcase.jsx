import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  Card,
  Modal,
  Table,
  Pagination,
  Alert,
  Loading,
  EmptyState,
  Breadcrumb,
  FileUpload,
} from "../components/common";
import { FiStar, FiHeart, FiUser } from "react-icons/fi";

const ComponentShowcase = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Components", path: "/components" },
    { label: "Showcase" },
  ];

  const tableColumns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    {
      header: "Status",
      render: (row) => <Badge variant="success">{row.status}</Badge>,
    },
  ];

  const tableData = [
    { name: "John Doe", email: "john@example.com", status: "Active" },
    { name: "Jane Smith", email: "jane@example.com", status: "Active" },
  ];

  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1>Component Showcase</h1>
        <p className="text-gray-600 mt-2">
          A complete demonstration of all available UI components
        </p>
      </div>

      <Breadcrumb items={breadcrumbItems} />

      {/* Buttons */}
      <Card>
        <Card.Header>
          <h3>Buttons</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <div className="space-x-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="space-x-3">
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Button variant="primary" size="md">
                Medium
              </Button>
              <Button variant="primary" size="lg">
                Large
              </Button>
            </div>
            <div className="space-x-3">
              <Button variant="primary" loading>
                Loading
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Badges */}
      <Card>
        <Card.Header>
          <h3>Badges</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-x-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Alerts */}
      <Card>
        <Card.Header>
          <h3>Alerts</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-3">
            <Alert type="success" message="This is a success alert!" />
            <Alert type="error" message="This is an error alert!" />
            <Alert type="warning" message="This is a warning alert!" />
            <Alert type="info" message="This is an info alert!" />
          </div>
        </Card.Body>
      </Card>

      {/* Form Elements */}
      <Card>
        <Card.Header>
          <h3>Form Elements</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Text Input" placeholder="Enter text" required />
            <Input label="Email Input" type="email" placeholder="Enter email" />
            <Select
              label="Select Dropdown"
              options={selectOptions}
              placeholder="Choose option"
            />
            <Input label="With Error" error="This field has an error" />
          </div>
          <Textarea
            label="Textarea"
            placeholder="Enter long text"
            rows={3}
            className="mt-4"
          />
        </Card.Body>
      </Card>

      {/* Table */}
      <Card>
        <Card.Header>
          <h3>Table</h3>
        </Card.Header>
        <Card.Body className="p-0">
          <Table columns={tableColumns} data={tableData} />
        </Card.Body>
        <Card.Footer>
          <Pagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
            itemsPerPage={10}
            totalItems={50}
          />
        </Card.Footer>
      </Card>

      {/* Modal */}
      <Card>
        <Card.Header>
          <h3>Modal</h3>
        </Card.Header>
        <Card.Body>
          <Button onClick={() => setShowModal(true)}>Open Modal</Button>

          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Example Modal"
          >
            <p className="mb-4">
              This is the modal content. You can put any content here.
            </p>
            <Modal.Footer>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>

      {/* Loading States */}
      <Card>
        <Card.Header>
          <h3>Loading States</h3>
        </Card.Header>
        <Card.Body>
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small</p>
              <Loading size="sm" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Medium</p>
              <Loading size="md" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Large</p>
              <Loading size="lg" />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Empty State */}
      <Card>
        <Card.Header>
          <h3>Empty State</h3>
        </Card.Header>
        <Card.Body>
          <EmptyState
            icon={FiStar}
            title="No items found"
            message="Try adjusting your filters or search terms"
            action={<Button variant="primary">Add New Item</Button>}
          />
        </Card.Body>
      </Card>

      {/* Icons */}
      <Card>
        <Card.Header>
          <h3>Icons (React Icons)</h3>
        </Card.Header>
        <Card.Body>
          <div className="flex items-center space-x-6">
            <FiStar size={32} className="text-primary-500" />
            <FiHeart size={32} className="text-red-500" />
            <FiUser size={32} className="text-secondary-500" />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Using React Icons (Feather Icons). Import from 'react-icons/fi'
          </p>
        </Card.Body>
      </Card>

      {/* File Upload */}
      <Card>
        <Card.Header>
          <h3>File Upload</h3>
        </Card.Header>
        <Card.Body>
          <FileUpload
            label="Upload Documents"
            accept=".pdf,.doc,.docx"
            multiple
            onChange={(files) => console.log("Files:", files)}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ComponentShowcase;
