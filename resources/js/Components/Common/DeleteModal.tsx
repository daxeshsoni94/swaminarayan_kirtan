import React, { useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap";
interface DeleteModalProps {
    show?: boolean;
    onDeleteClick?: (deleteRelatedPads: boolean) => void;
    onCloseClick?: () => void;
    recordId?: string;
    showPadsOption?: boolean; // ← new
    isGu?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    show,
    onDeleteClick,
    onCloseClick,
    recordId,
    showPadsOption = false,
    isGu = false,
}) => {
    const [deleteRelatedPads, setDeleteRelatedPads] = useState(false);

    // Reset checkbox every time modal opens
    useEffect(() => {
        if (show) {
            setDeleteRelatedPads(false);
        }
    }, [show]);
    return (
        <Modal show={show} onHide={onCloseClick} centered={true}>
            <Modal.Body className="py-3 px-5">
                <div className="mt-2 text-center">
                    <i className="ri-delete-bin-line display-5 text-danger"></i>
                    <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                        <h4>{isGu ? "શું તમે ખરેખર?" : "Are you sure?"}</h4>
                        <p className="text-muted mx-4 mb-0">
                            {isGu
                                ? `શું તમે આ રેકોર્ડ ${recordId ? recordId : ""} કાઢી નાખવા માંગો છો?`
                                : `Are you sure you want to remove this record ${recordId ? recordId : ""}?`}
                        </p>
                    </div>
                </div>
                {/* ★ Checkbox for related pads */}
                {showPadsOption && (
                    <div className="mt-3 text-center">
                        <Form.Check
                            type="checkbox"
                            id="delete-related-pads"
                            label={
                                isGu
                                    ? "સંબંધિત બધા પદો પણ કાઢી નાખો"
                                    : "Also delete all related pads"
                            }
                            checked={deleteRelatedPads}
                            onChange={(e) =>
                                setDeleteRelatedPads(e.target.checked)
                            }
                            className="d-inline-block"
                        />
                    </div>
                )}
                <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                    <button
                        type="button"
                        className="btn w-sm btn-light"
                        //data-bs-dismiss="modal"
                        onClick={onCloseClick}
                    >
                        {isGu ? "બંધ કરો" : "Close"}
                    </button>
                    <button
                        type="button"
                        className="btn w-sm btn-danger"
                        id="delete-record"
                        onClick={() => {
                            console.log("Yes Delete clicked!");
                            console.log(
                                "onDeleteClick exists?",
                                typeof onDeleteClick,
                            );
                            console.log(
                                "deleteRelatedPads =",
                                deleteRelatedPads,
                            );

                            if (onDeleteClick) {
                                onDeleteClick(deleteRelatedPads);
                            } else {
                                alert(
                                    "onDeleteClick is undefined! Prop is missing.",
                                );
                            }
                        }}
                    >
                        {isGu ? "હા, કાઢી નાખો!" : "Yes, Delete It!"}
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    ) as unknown as JSX.Element;
};

export default DeleteModal;
