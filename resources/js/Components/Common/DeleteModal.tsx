import React, { useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { usePage } from "@inertiajs/react";

interface DeleteModalProps {
    show?: boolean;
    onDeleteClick?: (deleteRelatedPads: boolean) => void;
    onCloseClick?: () => void;
    recordId?: string;
    showPadsOption?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    show,
    onDeleteClick,
    onCloseClick,
    recordId,
    showPadsOption = false,
}) => {
    const { translations } = usePage().props as any;

    // Centralized translations
    const t = translations || {};

    const [deleteRelatedPads, setDeleteRelatedPads] =
        useState(false);

    // Reset checkbox every time modal opens
    useEffect(() => {
        if (show) {
            setDeleteRelatedPads(false);
        }
    }, [show]);

    return (
        <Modal
            show={show}
            onHide={onCloseClick}
            centered={true}
        >
            <Modal.Body className="py-3 px-5">
                <div className="mt-2 text-center">
                    <i className="ri-delete-bin-line display-5 text-danger"></i>

                    <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                        <h4>
                            {t.are_you_sure}
                        </h4>

                        <p className="text-muted mx-4 mb-0">
                            {t.delete_record_confirmation}{" "}
                            {recordId || ""}
                        </p>
                    </div>
                </div>

                {/* Related pads checkbox */}
                {showPadsOption && (
                    <div className="mt-3 text-center">
                        <Form.Check
                            type="checkbox"
                            id="delete-related-pads"
                            label={
                                t.delete_related_pads
                            }
                            checked={deleteRelatedPads}
                            onChange={(e) =>
                                setDeleteRelatedPads(
                                    e.target.checked
                                )
                            }
                            className="d-inline-block"
                        />
                    </div>
                )}

                <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                        type="button"
                        className="btn w-sm btn-light"
                        onClick={onCloseClick}
                    >
                        {t.close}
                    </button>

                    <button
                        type="button"
                        className="btn w-sm btn-danger"
                        id="delete-record"
                        onClick={() => {
                            if (onDeleteClick) {
                                onDeleteClick(
                                    deleteRelatedPads
                                );
                            }
                        }}
                    >
                        {t.yes_delete}
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default DeleteModal;